-- Habilitar extensión uuid-ossp si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Actualizar la columna ci con el valor por defecto usando uuid_generate_v4
ALTER TABLE dirigente 
ALTER COLUMN ci SET DEFAULT uuid_generate_v4()::text;

