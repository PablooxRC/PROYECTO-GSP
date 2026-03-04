-- MIGRACIÓN: Agregar columna create_at a tabla scouts
-- Fecha: 11 de febrero de 2026
-- Descripción: Agrega timestamp de creación a scouts para filtrado de reportes

ALTER TABLE scouts 
ADD COLUMN IF NOT EXISTS create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear índice para mejor performance en filtros de fecha
CREATE INDEX IF NOT EXISTS idx_scouts_create_at ON scouts(create_at);

-- Verificar que la columna fue agregada correctamente
-- SELECT ci, nombre, create_at FROM scouts LIMIT 5;
