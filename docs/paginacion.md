# Paginación

El componente `Pagination` y el hook `usePaginatedList` se usan en Scouts, Registros (incluido admin), Dirigentes, Padrón, inventario Kral, materiales en uso, solicitudes, selector de materiales y las tres secciones de vista previa de reportes.

El frontend envía `page` y `pageSize` (20 por defecto; opciones 10, 20, 50 y 100). El backend valida los parámetros y aplica filtros y permisos antes de `COUNT`, `LIMIT` y `OFFSET`. Devuelve `{ items, pagination: { page, pageSize, total, totalPages } }`. La búsqueda y cambios de filtros reinician la página. Las peticiones obsoletas se cancelan; al eliminar el último elemento se ajusta a la última página disponible.

Las rutas existentes conservan su respuesta sin paginar cuando no reciben parámetros, para no truncar impresiones, exportaciones y consumidores anteriores. Los nuevos endpoints `/kral/materials`, `/kral/in-use` y `/admin/report-preview` siempre paginan. Las ubicaciones y unidades se mantienen como catálogos para formularios. La descarga Excel y el envío por correo no reciben la página de la vista previa.

## Verificación

`npm test` ejecuta las pruebas unitarias. Para las pruebas SQL en PostgreSQL, establecer `KRAL_INTEGRATION=1` y `PAGINATION_INTEGRATION=1`; se crean y eliminan únicamente esquemas temporales de prueba, sin tocar registros existentes.

La prueba `scripts/pagination-ui-smoke.cjs` usa Playwright y Edge con API simulada; requiere frontend en el puerto 5188 y `PLAYWRIGHT_MODULE` apuntando al módulo si no está instalado en el proyecto.
