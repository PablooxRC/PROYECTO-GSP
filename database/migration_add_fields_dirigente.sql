-- Añadir campos adicionales a la tabla dirigente para información extendida
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(200),
ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(200),
ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(200),
ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(200),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS sexo CHAR(1),
ADD COLUMN IF NOT EXISTS grupo VARCHAR(100),
ADD COLUMN IF NOT EXISTS nivel_formacion VARCHAR(200);

CREATE INDEX IF NOT EXISTS idx_dirigente_grupo ON dirigente(grupo);
CREATE INDEX IF NOT EXISTS idx_dirigente_nivel_formacion ON dirigente(nivel_formacion);
