# Diseño visual de Scout Panda

El rediseño conserva las rutas, formularios, permisos y comportamiento existente. Solo cambia la presentación de las 15 vistas y sus componentes compartidos.

La referencia visual es [Motion](https://motion.dev): tipografía expresiva, espacio claro y transiciones breves. La identidad del grupo se conserva con su logo y una paleta azul noche, lavanda y verde scout. No se añadieron librerías de animación.

Los tokens y clases compartidas están en `frontend/src/index.css`: páginas, filtros, formularios, tablas, tarjetas, estados, botones, navegación y diálogos. La fuente Manrope tiene una alternativa local Segoe UI. La navegación usa un menú compacto en pantallas menores de 1280 px; los formularios se apilan en móvil y las tablas tienen desplazamiento horizontal propio.

Se incluyeron foco de teclado visible, enlace para saltar al contenido, etiquetas de navegación, contraste en estados y respeto por `prefers-reduced-motion`.

## Verificación

- `npm run build --prefix frontend`
- `npm test`
- `node scripts/verify-visual-only.cjs`: compara código ejecutable, manejadores, restricciones, enlaces de datos y condiciones JSX con HEAD, omitiendo presentación.
- `scripts/design-ui-smoke.cjs`: revisa 16 rutas en 1440, 390 y 320 px, menús, vista previa y diálogos, usando una API simulada. Requiere Playwright, Edge y un frontend compilado en `http://127.0.0.1:5189`; se puede indicar `UI_BASE_URL`, `PLAYWRIGHT_MODULE` y `UI_SCREENSHOTS`.
- `scripts/pagination-ui-smoke.cjs`: conserva la prueba de paginación y selección de materiales.

Padrón y el contenedor administrativo de registros se revisan como componentes existentes; no se agregaron rutas para ellos. Las pruebas de PostgreSQL siguen siendo optativas. El lint completo detecta variables sin usar y advertencias de hooks que ya existían en HomePage, LoginPage y ScoutFormPage; no se modificó esa lógica.
