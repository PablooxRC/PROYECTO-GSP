-- Agregar columna admin_registrado a la tabla dirigente
ALTER TABLE dirigente
ADD COLUMN admin_registrado BOOLEAN DEFAULT false;

-- Marcar los dirigentes existentes como registrados por admin
UPDATE dirigente SET admin_registrado = true WHERE admin_registrado IS NULL;
