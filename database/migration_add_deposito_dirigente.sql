-- Migración: Agregar campos de depósito a dirigente
-- Fecha: 4 de marzo de 2026

ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS numero_deposito VARCHAR(255);
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS monto NUMERIC(10, 2);
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS fecha_deposito DATE;
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS hora_deposito TIME;