// Compare executable code and form bindings with HEAD, ignoring visual JSX.
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const parser = require("../frontend/node_modules/@babel/parser");
const root = path.resolve(__dirname, "..");
const git = (args) =>
  execFileSync(
    "git",
    ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, ...args],
    { cwd: root, encoding: "utf8" },
  );
const ignored = new Set([
  "start",
  "end",
  "loc",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "comments",
  "tokens",
]);
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  if (value.type === "JSXElement" || value.type === "JSXFragment")
    return { type: "Presentation" };
  if (
    value.type === "VariableDeclaration" &&
    value.declarations.every(
      (d) =>
        ["input", "button", "style"].includes(d.id.name) &&
        d.init?.type === "StringLiteral",
    )
  )
    return { type: "PresentationStyles" };
  const result = {};
  for (const key of Object.keys(value).sort())
    if (!ignored.has(key)) result[key] = normalize(value[key]);
  return result;
}
function signatures(source) {
  const tree = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
  const code = tree.program.body
    .filter((n) => n.type !== "ImportDeclaration")
    .map((n) => {
      // These existing constants only hold CSS classes.
      if (
        n.type === "VariableDeclaration" &&
        n.declarations.every((d) =>
          ["input", "button", "style"].includes(d.id.name),
        )
      )
        return null;
      return normalize(n);
    })
    .filter(Boolean);
  const bindings = [];
  function walk(n) {
    if (!n || typeof n !== "object") return;
    if (
      n.type === "JSXAttribute" &&
      /^(on[A-Z].*|value|checked|disabled|required|readOnly|type|name|min|max|step|pattern|multiple|accept|to|href|method|action|key|src)$/.test(
        n.name.name,
      )
    )
      bindings.push(JSON.stringify(normalize(n)));
    if (n.type === "JSXSpreadAttribute")
      bindings.push(JSON.stringify(normalize(n)));
    if (
      n.type === "JSXExpressionContainer" &&
      n.expression.type !== "JSXEmptyExpression" &&
      n.expression.type !== "StringLiteral"
    ) {
      const expression = normalize(n.expression);
      if (
        expression.type === "ConditionalExpression" &&
        expression.consequent.type === "StringLiteral" &&
        expression.alternate.type === "StringLiteral"
      ) {
        expression.consequent.value = "Presentation text";
        expression.alternate.value = "Presentation text";
      }
      bindings.push(JSON.stringify(expression));
    }
    for (const [key, value] of Object.entries(n))
      if (!ignored.has(key)) {
        if (
          n.type === "JSXAttribute" &&
          ["className", "style"].includes(n.name.name)
        )
          continue;
        if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === "object") walk(value);
      }
  }
  walk(tree);
  return { code: JSON.stringify(code), bindings: bindings.sort() };
}
let errors = 0;
const files = git(["diff", "--name-only"])
  .trim()
  .split(/\r?\n/)
  .filter((f) => /^frontend\/src\/.*\.jsx$/.test(f));
for (const file of files) {
  const before = signatures(git(["show", `HEAD:${file}`]));
  const after = signatures(fs.readFileSync(path.join(root, file), "utf8"));
  const counts = new Map();
  after.bindings.forEach((b) => counts.set(b, (counts.get(b) || 0) + 1));
  const missing = [];
  for (const binding of before.bindings) {
    if (counts.get(binding) > 0) counts.set(binding, counts.get(binding) - 1);
    else missing.push(binding);
  }
  if (before.code !== after.code || missing.length) {
    errors++;
    console.error(file, {
      executableCodeChanged: before.code !== after.code,
      missingBindings: missing,
    });
  } else
    console.log(
      `Preserved logic and ${before.bindings.length} bindings: ${file}`,
    );
}
if (errors) process.exitCode = 1;
else
  console.log(
    `Visual-only parity verified for ${files.length} frontend files.`,
  );
