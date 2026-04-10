-- Hacer email opcional en tabla dirigente
ALTER TABLE dirigente ALTER COLUMN email DROP NOT NULL;
ALTER TABLE dirigente DROP CONSTRAINT IF EXISTS dirigente_email_key;
