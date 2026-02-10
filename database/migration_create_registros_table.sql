-- Migración: Crear tabla 'registros' para registros financieros y educativos de scouts
-- Fecha: 10 de febrero de 2026

CREATE TABLE registros (
    id SERIAL PRIMARY KEY,
    scout_ci INTEGER NOT NULL REFERENCES scouts(ci) ON DELETE CASCADE,
    unidad VARCHAR(255),
    etapa_progresion VARCHAR(255),
    colegio VARCHAR(255),
    curso VARCHAR(255),
    numero_deposito VARCHAR(255),
    fecha_deposito DATE,
    monto NUMERIC(10, 2),
    envio VARCHAR(500),
    contacto_parentesco VARCHAR(255),
    contacto_nombre VARCHAR(255),
    contacto_celular VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dirigente_ci INTEGER NOT NULL
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_registros_scout_ci ON registros(scout_ci);
CREATE INDEX idx_registros_dirigente_ci ON registros(dirigente_ci);
CREATE INDEX idx_registros_fecha_deposito ON registros(fecha_deposito);
