-- Agregar campos de cargos para dirigentes
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS cargo_1 VARCHAR(200),
ADD COLUMN IF NOT EXISTS cargo_2 VARCHAR(200);
