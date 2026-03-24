-- Migración: Agregar campo hora_deposito a tabla registros
-- Fecha: 17 de marzo de 2026

ALTER TABLE registros ADD COLUMN IF NOT EXISTS hora_deposito TIME;
