// Uso: PLAYWRIGHT_MODULE=<ruta a playwright> node scripts/pagination-ui-smoke.cjs
// Requiere frontend local en http://127.0.0.1:5188. API simulada, no modifica datos.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    });
    const errors = [];
    const calls = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() =>
      localStorage.setItem("token", "pagination-test"),
    );
    await page.route("**/api/**", async (route) => {
      const url = new URL(route.request().url()),
        path = url.pathname;
      if (!path.startsWith('/api/')) return route.continue();
      calls.push(url);
      const number = Number(url.searchParams.get("page") || 1),
        size = Number(url.searchParams.get("pageSize") || 20);
      let response = {
        items: [],
        pagination: { page: number, pageSize: size, total: 0, totalPages: 1 },
      };
      if (path.endsWith("/profile"))
        response = { data: { ci: "demo", unidad: "Jacala", is_admin: true } };
      if (path.endsWith("/kral/locations"))
        response = [{ id: 1, name: "Kral", external: false }];
      if (path.endsWith("/kral/materials")) {
        const rows = Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          name: `Material ${String(i + 1).padStart(2, "0")}`,
          location_id: 1,
          location: "Kral",
          unit: "GRUPO",
          category: "",
          measure: "unidad",
          total: 3,
          available: 3,
          in_use: 0,
          notes: "",
        })).filter((m) =>
          m.name.includes(url.searchParams.get("search") || ""),
        );
        response = {
          items: rows.slice((number - 1) * size, number * size),
          pagination: {
            page: number,
            pageSize: size,
            total: rows.length,
            totalPages: Math.max(1, Math.ceil(rows.length / size)),
          },
        };
      }
      if (path.endsWith("/admin/report-preview"))
        response = {
          items: [],
          pagination: { page: number, pageSize: size, total: 0, totalPages: 1 },
        };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
    await page.goto(`${process.env.UI_BASE_URL || 'http://127.0.0.1:5188'}/kral`, {
      waitUntil: "domcontentloaded",
    });
    const inventory = page.getByRole("navigation", {
      name: "Inventario",
      exact: true,
    });
    await inventory.getByText("1–20 de 25", { exact: true }).waitFor();
    await inventory.getByRole("button", { name: "Siguiente" }).click();
    await inventory.getByText("21–25 de 25", { exact: true }).waitFor();
    assert(
      calls.some(
        (u) =>
          u.pathname.endsWith("/kral/materials") &&
          u.searchParams.get("page") === "2",
      ),
    );
    await inventory.getByRole("combobox").selectOption("10");
    await inventory.getByText("1–10 de 25", { exact: true }).waitFor();
    await page
      .getByRole("link", { name: "Solicitudes de material", exact: true })
      .click();
    const picker = page.getByRole("navigation", {
      name: "Materiales disponibles",
      exact: true,
    });
    await picker.getByText("1–20 de 25", { exact: true }).waitFor();
    const select = page
      .getByRole("combobox")
      .filter({ has: page.locator('option[value="1"]') })
      .first();
    await select.selectOption("1");
    await picker.getByRole("button", { name: "Siguiente" }).click();
    await picker.getByText("21–25 de 25", { exact: true }).waitFor();
    assert.equal(await select.inputValue(), "1");
    await page
      .getByLabel("Buscar material", { exact: true })
      .fill("Material 25");
    await picker.getByText("1–1 de 1", { exact: true }).waitFor();
    assert.equal(await select.inputValue(), "1");
    await page.getByLabel('Buscar material', {exact:true}).fill('');
    await picker.getByText('1–20 de 25', {exact:true}).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.goto(`${process.env.UI_BASE_URL || 'http://127.0.0.1:5188'}/admin/send-report`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("button", { name: /Vista previa/i }).click();
    await page
      .getByRole("navigation", { name: "Registros del reporte" })
      .waitFor();
    assert.equal(
      calls.filter((u) => u.pathname.endsWith("/admin/report-preview")).length,
      3,
    );
    assert.deepEqual(errors, []);
    console.log(
      "UI OK: página siguiente, tamaño, filtros reinician página, selección conservada, reportes y móvil.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
