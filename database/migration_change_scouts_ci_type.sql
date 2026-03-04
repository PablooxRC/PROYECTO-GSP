-- Migración: Cambiar ci de INTEGER a VARCHAR en scouts
-- Fecha: 4 de marzo de 2026

ALTER TABLE scouts ALTER COLUMN ci TYPE VARCHAR(20);