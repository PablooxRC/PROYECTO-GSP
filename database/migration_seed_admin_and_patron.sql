-- migration_seed_admin_and_patron.sql
-- Inserta los usuarios admin y patrón iniciales con contraseñas hasheadas
-- Ejecutar DESPUÉS de todas las migraciones

-- Hash bcrypt de "admin123" (rounds=10)
-- Contraseña: admin123
INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin)
VALUES (
    8637944,
    'Pablo',
    'Rodriguez Castro',
    'admin@scouts.com',
    'Admin',
    '$2b$10$0L6e.aIFvzXPzg5F4eFnR.EBPf1vRXN.Z7V7FX4FvDvPm3Rg/d9s2',
    true
)
ON CONFLICT (ci) DO NOTHING;

-- Hash bcrypt de "patron123" (rounds=10)
-- Contraseña: patron123
INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin)
VALUES (
    1111111,
    'Patrón',
    'Principal',
    'patron@scouts.com',
    'Administración',
    '$2b$10$h9/vFNPspQs8pzUxV7ixW.h8zfQ9E1TjV7xW6J7DsM5RYfQ8K2E8m',
    true
)
ON CONFLICT (ci) DO NOTHING;

-- Verificar insertados
SELECT ci, nombre, apellido, email, is_admin FROM dirigente 
WHERE is_admin = true
ORDER BY ci;
