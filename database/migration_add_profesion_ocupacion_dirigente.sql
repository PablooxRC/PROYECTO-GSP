-- Agregar campo de profesion u ocupacion para dirigentes
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS profesion_ocupacion VARCHAR(200);
