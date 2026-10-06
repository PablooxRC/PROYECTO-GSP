// Read-only UI checks against a local preview. Every API request is mocked.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.UI_BASE_URL || "http://127.0.0.1:5189";
const output =
  process.env.UI_SCREENSHOTS ||
  path.join(require("node:os").tmpdir(), "scout-panda-design");
const leader = {
  ci: "D1",
  nombre: "Mariana",
  apellido: "Vargas",
  primer_nombre: "Mariana",
  primer_apellido: "Vargas",
  email: "mariana@example.test",
  unidad: "Jacala",
  is_admin: true,
  admin_registrado: true,
  create_at: "2026-01-12",
  fecha_nacimiento: "1995-03-20",
  fecha_deposito: "2026-09-15",
  nivel_formacion: "IM",
  gravatar:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23303b50"/%3E%3C/svg%3E',
};
const scouts = Array.from({ length: 4 }, (_, i) => ({
  ci: `S${i + 1}`,
  nombre: ["Mateo", "Valentina", "Santiago", "Camila"][i],
  apellido: ["Arnez", "Vargas", "Rojas", "Salazar"][i],
  primer_nombre: "Mateo",
  primer_apellido: "Arnez",
  fecha_nacimiento: "2014-08-12",
  unidad: "Jacala",
  rama: "Lobatos",
  puntaje: 12 + i,
  preguntas_mal_contestadas: i,
  create_at: "2026-08-10",
}));
const records = scouts.map((s, i) => ({
  id: 128 - i,
  scout_ci: s.ci,
  scout_nombre: s.nombre,
  scout_apellido: s.apellido,
  dirigente_ci: "D1",
  unidad: "Jacala",
  etapa_progresion: "Saltador",
  colegio: "Colegio San Agustín",
  numero_deposito: "3P86868522",
  fecha_deposito: "2026-08-12",
  monto: 190,
  envio: "TERCER ENVÍO",
}));
const materials = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  reference: String(i + 64),
  name: [
    "Cuerdas grandes",
    "Carpa de patrulla",
    "Olla de campamento",
    "Botiquín",
  ][i % 4],
  category: ["Cabuyería", "Campamento", "Cocina", "Seguridad"][i % 4],
  location_id: 1,
  location: "Kral San Agustín",
  external: false,
  unit: "GRUPO",
  measure: "unidad",
  total: 12,
  available: 9,
  in_use: 3,
  notes: "",
}));
const requests = [
  {
    id: 1,
    unit: "Jacala",
    place: "Parque Tunari",
    purpose: "Campamento de unidad",
    status: "pending",
    requester_ci: "D1",
    created_at: "2026-09-10T12:00:00Z",
    use_at: "2026-10-10T14:00:00Z",
    return_at: "2026-10-11T22:00:00Z",
    items: [
      {
        material_id: 1,
        name: "Cuerdas grandes",
        location: "Kral San Agustín",
        quantity: 3,
        measure: "unidad",
      },
    ],
  },
];
function paged(rows, url) {
  const size = Number(url.searchParams.get("pageSize") || 20),
    page = Number(url.searchParams.get("page") || 1);
  return {
    items: rows.slice((page - 1) * size, page * size),
    pagination: {
      page,
      pageSize: size,
      total: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / size)),
    },
  };
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    for (const authenticated of [false, true]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
      });
      if (authenticated)
        await context.addInitScript(() =>
          localStorage.setItem("token", "design-test"),
        );
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route("**/api/**", async (route) => {
        const url = new URL(route.request().url()),
          p = url.pathname;
        if (!p.startsWith("/api/")) return route.continue();
        assert.equal(route.request().method(), 'GET', 'Closing must not submit a form');
        let response = {};
        if (p === "/api/profile") response = { data: leader };
        else if (p === "/api/scouts")
          response = url.searchParams.has("page") ? paged(scouts, url) : scouts;
        else if (p.startsWith("/api/scouts/")) response = scouts[0];
        else if (p === "/api/registros") response = paged(records, url);
        else if (p === "/api/registros/unidades")
          response = ["Jacala", "Hathi"];
        else if (p === "/api/admin/dirigentes-list")
          response = paged([leader], url);
        else if (p.startsWith("/api/admin/dirigentes/")) response = leader;
        else if (p === "/api/admin/report-preview")
          response = paged(
            url.searchParams.get("section") === "registros"
              ? records
              : url.searchParams.get("section") === "dirigentes"
                ? [{ ...leader, registros_count: 4 }]
                : [],
            url,
          );
        else if (p === "/api/kral/locations")
          response = [
            { id: 1, name: "Kral San Agustín", external: false },
            { id: 2, name: "Casa del grupo", external: true },
          ];
        else if (p === "/api/kral/materials") response = paged(materials, url);
        else if (p === "/api/kral/requests") response = paged(requests, url);
        else if (p === "/api/kral/in-use")
          response = paged(
            [
              {
                material_id: 1,
                name: "Cuerdas grandes",
                quantity: 3,
                request_id: 2,
                unit: "Hathi",
                place: "Parque Tunari",
                use_at: "2026-10-01T14:00:00Z",
                return_at: "2026-10-02T22:00:00Z",
              },
            ],
            url,
          );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
      });
      const routes = authenticated
        ? [
            "/scouts",
            "/scouts/new",
            "/scouts/S1/edit",
            "/registros",
            "/admin/create",
            "/admin/dirigentes",
            "/admin/dirigentes/create",
            "/admin/dirigentes/D1/edit",
            "/admin/send-report",
            "/profile",
            "/kral",
            "/kral/solicitudes",
          ]
        : ["/", "/login", "/register", "/pagina-inexistente"];
      for (const route of routes) {
        const name =
          route === "/" ? "inicio" : route.slice(1).replaceAll("/", "-");
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(base + route, { waitUntil: "domcontentloaded" });
          await page
            .locator("#main-content h1, #main-content h2")
            .first()
            .waitFor();
          if (route === "/kral")
            await page
              .getByRole("cell", {
                name: "Cuerdas grandes unidad",
                exact: true,
              })
              .first()
              .waitFor();
          if (route === "/scouts")
            await page
              .getByRole("heading", { name: "Mateo Arnez", exact: true })
              .waitFor();
          if (route === "/admin/dirigentes")
            await page
              .getByRole("heading", { name: "Mariana Vargas", exact: true })
              .waitFor();
          if (route === "/registros" && width < 640) {
            const dates = page.locator('input[type="date"]');
            await dates.nth(0).fill("2026-08-01");
            await dates.nth(1).fill("2026-09-30");
            const widths = await dates.evaluateAll((elements) =>
              elements.map((el) => el.getBoundingClientRect().width),
            );
            assert(
              widths.every((w) => w >= 180),
              `Date fields clipped at ${width}: ${widths}`,
            );
          }
          const overflow = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
          }));
          assert(
            overflow.scroll <= width + 1,
            `${route} overflows at ${width}: ${overflow.scroll}`,
          );
          if (width !== 320)
            await page.screenshot({
              path: path.join(output, `${name}-${width}.png`),
              fullPage: true,
            });
          if (width === 390) {
            await page
              .getByRole("button", { name: "Abrir menú", exact: true })
              .click();
            await page.locator("#mobile-navigation").waitFor();
            await page
              .getByRole("button", { name: "Cerrar menú", exact: true })
              .click();
          }
        }
        const closeRoutes = {
          '/register':'/login', '/scouts/new':'/scouts', '/scouts/S1/edit':'/scouts',
          '/admin/create':'/admin/dirigentes', '/admin/dirigentes/create':'/admin/dirigentes',
          '/admin/dirigentes/D1/edit':'/admin/dirigentes', '/admin/send-report':'/registros',
          '/kral/solicitudes':'/kral'
        };
        if (closeRoutes[route]) {
          await page.getByRole('button', {name:'Cerrar', exact:true}).click();
          await page.waitForURL(base + closeRoutes[route]);
        }
        console.log(`Responsive OK ${route}`);
      }
      if (authenticated) {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(base + "/admin/send-report", {
          waitUntil: "domcontentloaded",
        });
        await page.getByRole("button", { name: /^Vista previa$/i }).click();
        await page
          .getByRole("heading", { name: /Scouts con depósito registrado/i })
          .waitFor();
        await page.screenshot({
          path: path.join(output, "reporte-vista-previa-1440.png"),
          fullPage: true,
        });
        await page.goto(base + "/scouts", { waitUntil: "domcontentloaded" });
        await page
          .getByRole("button", { name: "Eliminar", exact: true })
          .first()
          .click();
        await page
          .getByRole("dialog", { name: "Confirmar eliminación" })
          .waitFor();
        await page.screenshot({
          path: path.join(output, "confirmacion-1440.png"),
        });
        await page
          .getByRole("button", { name: "Cancelar", exact: true })
          .click();
        await page.goto(base + "/kral", { waitUntil: "domcontentloaded" });
        await page.getByText('Crear ubicación', {exact:true}).click();
        const locationForm=page.locator('details');
        await locationForm.getByRole('button', {name:'Cerrar', exact:true}).click();
        assert.equal(await locationForm.getAttribute('open'), null);
        await page
          .getByRole("button", { name: "Nuevo material", exact: true })
          .click();
        await page
          .getByRole("dialog", { name: "Material", exact: true })
          .waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({
          path: path.join(output, "material-dialogo-390.png"),
        });
        const materialDialog=page.getByRole('dialog', {name:'Material', exact:true});
        await materialDialog.getByRole('button', {name:'Cerrar',exact:true}).click();
        await materialDialog.waitFor({state:'hidden'});
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(
      `UI verified: 16 routes at desktop/mobile/320px, menus, report preview and dialogs. Screenshots: ${output}`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
