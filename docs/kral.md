# Inventario y solicitudes de Kral

Las vistas autenticadas son `/kral` y `/kral/solicitudes`. Todos los usuarios autenticados consultan inventario y crean solicitudes; cada usuario ve sus solicitudes. Los administradores ven todas, crean ubicaciones/materiales, ajustan cantidades y aprueban, rechazan o confirman devoluciones completas.

Una solicitud pendiente no reserva existencias. La aprobación descuenta todas sus cantidades en una transacción y vuelve a comprobar disponibilidad. El rechazo no cambia stock. La devolución completa repone las cantidades una sola vez. Las solicitudes aprobadas se muestran en uso, con unidad, lugar y fecha de devolución. No se permiten totales inferiores al material prestado. Las devoluciones parciales y consumos definitivos no forman parte de este flujo.

## Preparación de cada entorno

Configurar las variables PostgreSQL habituales del proyecto y ejecutar:

```sh
npm run kral:setup
npm run kral:setup -- "ruta/kral 2026.xlsx"
```

El segundo comando también importa el Excel. Cada hoja INVENTARIO representa una ubicación. Conserva N°, nombre, categoría y unidad propietaria. Separa cantidades como `1 bolsa` en cantidad y presentación. Las cantidades no numéricas quedan en cero con una observación para revisión. No importa las hojas vacías de solicitudes/requerimientos. Ejecutar nuevamente el mismo archivo no duplica materiales ni restablece cantidades modificadas.

El esquema se agrega a la lista habitual de migraciones. Para un entorno existente se recomienda `kral:setup`, que aplica únicamente las tablas del nuevo módulo. Después, reiniciar/desplegar el backend y compilar/desplegar el frontend con `npm run build` en `frontend`.

## Prueba de integración

En PowerShell, con la base local configurada:

```powershell
$env:KRAL_INTEGRATION='1'
node --test test/kral.integration.test.js
Remove-Item Env:KRAL_INTEGRATION
```

La prueba crea y elimina un esquema temporal exclusivo. Comprueba permisos HTTP, aislamiento de solicitudes, rango temporal, cantidades duplicadas, aprobaciones concurrentes, stock insuficiente, devolución repetida y reversión de operaciones con varios materiales.
