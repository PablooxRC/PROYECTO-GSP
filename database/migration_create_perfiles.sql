-- Migración: Crear tabla 'perfiles' para usuarios registrados en el sistema
-- Los perfiles son distintos de los dirigentes (creados por el admin)
-- Fecha: 17 de marzo de 2026

CREATE TABLE IF NOT EXISTS perfiles (
    ci VARCHAR(50) PRIMARY KEY,
    email VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    unidad VARCHAR(200) NOT NULL,
    gravatar VARCHAR(250),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ampliar ci si ya se creó con VARCHAR(20)
ALTER TABLE perfiles ALTER COLUMN ci TYPE VARCHAR(50);

-- Eliminar FK de scouts.dirigente_ci → dirigente para permitir que
-- los perfiles también puedan gestionar sus scouts
ALTER TABLE scouts DROP CONSTRAINT IF EXISTS scouts_dirigente_ci_fkey;

-- Migrar usuarios auto-registrados existentes de dirigente → perfiles
INSERT INTO perfiles (ci, email, password, unidad, gravatar, create_at)
SELECT ci, email, password, unidad, gravatar, COALESCE(create_at, NOW())
FROM dirigente
WHERE admin_registrado = FALSE AND is_admin = FALSE
ON CONFLICT (email) DO NOTHING;

-- Eliminar usuarios auto-registrados de la tabla dirigente
DELETE FROM dirigente WHERE admin_registrado = FALSE AND is_admin = FALSE;

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);
