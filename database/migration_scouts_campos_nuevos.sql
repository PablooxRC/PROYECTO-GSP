-- MIGRACIÓN: Agregar nuevos campos a tabla scouts
-- Fecha: 10 de febrero de 2026
-- Descripción: Agrega campos para información detallada de scouts

-- IMPORTANTE: Ejecutar estos comandos en psql
-- Conectar: psql -U postgres -d Scouts
-- Luego copiar y pegar estos comandos

-- 1. Agregar columnas para nombres y apellidos
ALTER TABLE scouts 
ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
ADD COLUMN IF NOT EXISTS grupo VARCHAR(255) DEFAULT 'PANDA',
ADD COLUMN IF NOT EXISTS curso VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero_deposito VARCHAR(255),
ADD COLUMN IF NOT EXISTS monto NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS es_beca BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tipo_beca VARCHAR(255),
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre_parentesco VARCHAR(500),
ADD COLUMN IF NOT EXISTS contacto_emergencia_celular VARCHAR(20);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_scouts_grupo ON scouts(grupo);
CREATE INDEX IF NOT EXISTS idx_scouts_es_beca ON scouts(es_beca);

-- 3. Verificar que la tabla fue actualizada correctamente
-- SELECT * FROM scouts LIMIT 1;

-- NOTAS:
-- - Todos los campos nuevos son NULLABLE o tienen DEFAULT para no afectar registros existentes
-- - El campo 'grupo' por defecto es 'PANDA' como solicitaste
-- - El campo 'es_beca' por defecto es FALSE
-- - Los campos nombre y apellido antiguos se mantienen para compatibilidad
-- - Si necesitas, puedes copiar datos: 
--   UPDATE scouts SET primer_nombre = nombre, primer_apellido = apellido WHERE primer_nombre = '';
