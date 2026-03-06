-- Cambiar el tipo de dirigente_ci en tabla registros de INTEGER a VARCHAR
ALTER TABLE registros 
ALTER COLUMN dirigente_ci TYPE VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_registros_dirigente_ci ON registros(dirigente_ci);
