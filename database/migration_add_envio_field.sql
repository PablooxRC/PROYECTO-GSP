-- Migración: Agregar campo 'envio' a la tabla scouts
-- Fecha: 10 de febrero de 2026

ALTER TABLE scouts
ADD COLUMN envio VARCHAR(500);

-- Índice para búsquedas por envio
CREATE INDEX idx_scouts_envio ON scouts(envio);
