-- Migración: Ampliar columnas ci a VARCHAR(50) para permitir CIs generados automáticamente
-- Fecha: 17 de marzo de 2026

ALTER TABLE dirigente ALTER COLUMN ci TYPE VARCHAR(50);
ALTER TABLE scouts ALTER COLUMN dirigente_ci TYPE VARCHAR(50);
ALTER TABLE registros ALTER COLUMN dirigente_ci TYPE VARCHAR(50);
