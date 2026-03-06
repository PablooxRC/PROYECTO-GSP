-- Añade columna es_colaborador a la tabla dirigente
ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS es_colaborador BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_es_colaborador ON dirigente(es_colaborador);
