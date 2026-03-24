-- Tabla padrón: registro maestro de personas (scouts y dirigentes)
-- Se usa para auto-completar formularios al ingresar el CI

CREATE TABLE IF NOT EXISTS padron (
    ci VARCHAR(50) PRIMARY KEY,
    primer_nombre VARCHAR(200),
    segundo_nombre VARCHAR(200),
    primer_apellido VARCHAR(200),
    segundo_apellido VARCHAR(200),
    fecha_nacimiento DATE,
    sexo CHAR(1),
    unidad VARCHAR(200),
    colegio VARCHAR(200),
    nivel_formacion VARCHAR(200),
    contacto_nombre VARCHAR(200),
    contacto_parentesco VARCHAR(200),
    contacto_celular VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_padron_ci ON padron(ci);
