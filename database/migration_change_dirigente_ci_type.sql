-- Cambiar el tipo de CI en tabla dirigente de INTEGER a VARCHAR
ALTER TABLE scouts 
DROP CONSTRAINT IF EXISTS scouts_dirigente_ci_fkey;

ALTER TABLE dirigente 
DROP CONSTRAINT IF EXISTS dirigente_pkey CASCADE;

ALTER TABLE dirigente 
ALTER COLUMN ci TYPE VARCHAR(20);

ALTER TABLE dirigente 
ADD CONSTRAINT dirigente_pkey PRIMARY KEY (ci);

-- Actualizar la referencia en scouts
ALTER TABLE scouts 
ALTER COLUMN dirigente_ci TYPE VARCHAR(20);

-- FK eliminada intencionalmente: scouts.dirigente_ci puede apuntar a dirigente o perfiles

CREATE INDEX IF NOT EXISTS idx_dirigente_ci ON dirigente(ci);
