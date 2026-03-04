-- Migración: Cambiar scout_ci de INTEGER a VARCHAR en tabla registros
-- Fecha: 4 de marzo de 2026

-- Eliminar la restricción de llave foránea si existe
ALTER TABLE registros DROP CONSTRAINT IF EXISTS registros_scout_ci_fkey;

-- Cambiar el tipo de la columna
ALTER TABLE registros ALTER COLUMN scout_ci TYPE VARCHAR(20);

-- Recrear la restricción de llave foránea
ALTER TABLE registros ADD CONSTRAINT registros_scout_ci_fkey FOREIGN KEY (scout_ci) REFERENCES scouts(ci) ON DELETE CASCADE;