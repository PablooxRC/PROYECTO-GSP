-- Añade columna envio a la tabla dirigente
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS envio BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_envio ON dirigente(envio);
