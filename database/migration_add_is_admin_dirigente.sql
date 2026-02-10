-- Añade columna is_admin a la tabla dirigente
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_is_admin ON dirigente(is_admin);
