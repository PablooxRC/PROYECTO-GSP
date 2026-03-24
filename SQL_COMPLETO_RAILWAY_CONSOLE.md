# 📋 SQL COMPLETO PARA COPIAR Y PEGAR EN RAILWAY CONSOLE

**Instrucciones:**

1. Abre: https://railway.app/
2. Selecciona tu proyecto
3. Ve a PostgreSQL → Console
4. Copia y pega TODO el contenido de abajo
5. Presiona Enter/Execute

---

## 🔧 SQL COMPLETO (TODAS LAS TABLAS + MIGRACIONES)

```sql
-- ============================================
-- INIT.SQL - TABLAS BASE
-- ============================================

CREATE TABLE scouts(
    ci VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rama VARCHAR(255) NOT NULL,
    unidad VARCHAR(255) NOT NULL,
    etapa VARCHAR(255) NOT NULL,
    nivel_actual VARCHAR(255),
    logros INTEGER,
    apellido VARCHAR(255)
);

CREATE TABLE dirigente (
    ci INTEGER PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    apellido VARCHAR(200) NOT NULL,
    unidad VARCHAR(200) NOT NULL,
    password VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upadate_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gravatar VARCHAR(250)
);

ALTER TABLE scouts ADD COLUMN dirigente_ci INTEGER REFERENCES dirigente(ci);

-- ============================================
-- MIGRACIÓN 1: admin_registrado
-- ============================================

ALTER TABLE dirigente
ADD COLUMN admin_registrado BOOLEAN DEFAULT false;

UPDATE dirigente SET admin_registrado = true WHERE admin_registrado IS NULL;

-- ============================================
-- MIGRACIÓN 2: create_at_scouts
-- ============================================

ALTER TABLE scouts
ADD COLUMN IF NOT EXISTS create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_scouts_create_at ON scouts(create_at);

-- ============================================
-- MIGRACIÓN 3: deposito_dirigente
-- ============================================

ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS numero_deposito VARCHAR(255);
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS monto NUMERIC(10, 2);
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS fecha_deposito DATE;
ALTER TABLE dirigente ADD COLUMN IF NOT EXISTS hora_deposito TIME;

-- ============================================
-- MIGRACIÓN 4: envio_dirigente
-- ============================================

ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS envio BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_envio ON dirigente(envio);

-- ============================================
-- MIGRACIÓN 5: envio_field (scouts)
-- ============================================

ALTER TABLE scouts
ADD COLUMN envio VARCHAR(500);

CREATE INDEX idx_scouts_envio ON scouts(envio);

-- ============================================
-- MIGRACIÓN 6: es_colaborador_dirigente
-- ============================================

ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS es_colaborador BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_es_colaborador ON dirigente(es_colaborador);

-- ============================================
-- MIGRACIÓN 7: fields_dirigente
-- ============================================

ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(200),
ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(200),
ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(200),
ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(200),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS sexo CHAR(1),
ADD COLUMN IF NOT EXISTS grupo VARCHAR(100),
ADD COLUMN IF NOT EXISTS nivel_formacion VARCHAR(200);

CREATE INDEX IF NOT EXISTS idx_dirigente_grupo ON dirigente(grupo);
CREATE INDEX IF NOT EXISTS idx_dirigente_nivel_formacion ON dirigente(nivel_formacion);

-- ============================================
-- MIGRACIÓN 8: hora_deposito_registros (REQUIERE TABLA REGISTROS)
-- ============================================

-- Saltaremos esta por ahora, se ejecutará después

-- ============================================
-- MIGRACIÓN 9: is_admin_dirigente
-- ============================================

ALTER TABLE dirigente
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_dirigente_is_admin ON dirigente(is_admin);

-- ============================================
-- MIGRACIÓN 10: auto_increment_dirigente_ci
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE dirigente
ALTER COLUMN ci SET DEFAULT uuid_generate_v4()::text;

-- ============================================
-- MIGRACIÓN 11: change_dirigente_ci_type
-- ============================================

ALTER TABLE scouts
DROP CONSTRAINT IF EXISTS scouts_dirigente_ci_fkey;

ALTER TABLE dirigente
DROP CONSTRAINT IF EXISTS dirigente_pkey CASCADE;

ALTER TABLE dirigente
ALTER COLUMN ci TYPE VARCHAR(20);

ALTER TABLE dirigente
ADD CONSTRAINT dirigente_pkey PRIMARY KEY (ci);

ALTER TABLE scouts
ALTER COLUMN dirigente_ci TYPE VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_dirigente_ci ON dirigente(ci);

-- ============================================
-- MIGRACIÓN 12: change_envio_type
-- ============================================

ALTER TABLE dirigente
ALTER COLUMN envio TYPE TEXT;

-- ============================================
-- MIGRACIÓN 13: change_scouts_ci_type
-- ============================================

ALTER TABLE scouts ALTER COLUMN ci TYPE VARCHAR(20);

-- ============================================
-- MIGRACIÓN 14: create_padron
-- ============================================

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

-- ============================================
-- MIGRACIÓN 15: create_perfiles
-- ============================================

CREATE TABLE IF NOT EXISTS perfiles (
    ci VARCHAR(50) PRIMARY KEY,
    email VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    unidad VARCHAR(200) NOT NULL,
    gravatar VARCHAR(250),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE perfiles ALTER COLUMN ci TYPE VARCHAR(50);

ALTER TABLE scouts DROP CONSTRAINT IF EXISTS scouts_dirigente_ci_fkey;

INSERT INTO perfiles (ci, email, password, unidad, gravatar, create_at)
SELECT ci, email, password, unidad, gravatar, COALESCE(create_at, NOW())
FROM dirigente
WHERE admin_registrado = FALSE AND is_admin = FALSE
ON CONFLICT (email) DO NOTHING;

DELETE FROM dirigente WHERE admin_registrado = FALSE AND is_admin = FALSE;

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);

-- ============================================
-- MIGRACIÓN 16: create_registros_table
-- ============================================

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

CREATE INDEX idx_registros_scout_ci ON registros(scout_ci);
CREATE INDEX idx_registros_dirigente_ci ON registros(dirigente_ci);
CREATE INDEX idx_registros_fecha_deposito ON registros(fecha_deposito);

-- ============================================
-- MIGRACIÓN 17: create_report_logs
-- ============================================

CREATE TABLE IF NOT EXISTS report_logs (
  id SERIAL PRIMARY KEY,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_by INTEGER REFERENCES dirigente(ci),
  "from" DATE,
  "to" DATE,
  recipient_email VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_report_logs_sent_at ON report_logs(sent_at);

-- ============================================
-- MIGRACIÓN 18: expand_ci_varchar
-- ============================================

ALTER TABLE dirigente ALTER COLUMN ci TYPE VARCHAR(50);
ALTER TABLE scouts ALTER COLUMN dirigente_ci TYPE VARCHAR(50);
ALTER TABLE registros ALTER COLUMN dirigente_ci TYPE VARCHAR(50);

-- ============================================
-- MIGRACIÓN 19: scouts_campos_nuevos
-- ============================================

ALTER TABLE scouts
ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
ADD COLUMN IF NOT EXISTS grupo VARCHAR(255) DEFAULT 'PANDA',
ADD COLUMN IF NOT EXISTS curso VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero_deposito VARCHAR(255),
ADD COLUMN IF NOT EXISTS monto NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS es_beca BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tipo_beca VARCHAR(255),
ADD COLUMN IF NOT EXISTS contacto_emergencia_nombre_parentesco VARCHAR(500),
ADD COLUMN IF NOT EXISTS contacto_emergencia_celular VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_scouts_grupo ON scouts(grupo);
CREATE INDEX IF NOT EXISTS idx_scouts_es_beca ON scouts(es_beca);

-- ============================================
-- MIGRACIÓN 20: change_registros_dirigente_ci_type
-- ============================================

ALTER TABLE registros
ALTER COLUMN dirigente_ci TYPE VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_registros_dirigente_ci ON registros(dirigente_ci);

-- ============================================
-- MIGRACIÓN 21: change_scout_ci_type (registros)
-- ============================================

ALTER TABLE registros DROP CONSTRAINT IF EXISTS registros_scout_ci_fkey;

ALTER TABLE registros ALTER COLUMN scout_ci TYPE VARCHAR(20);

ALTER TABLE registros ADD CONSTRAINT registros_scout_ci_fkey FOREIGN KEY (scout_ci) REFERENCES scouts(ci) ON DELETE CASCADE;

-- ============================================
-- MIGRACIÓN 22: hora_deposito_registros (AHORA SÍ)
-- ============================================

ALTER TABLE registros ADD COLUMN IF NOT EXISTS hora_deposito TIME;

-- ============================================
-- MIGRACIÓN 23: seed_admin_and_patron (USUARIOS INICIALES)
-- ============================================

INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin)
VALUES (
    '8637944',
    'Pablo',
    'Rodriguez Castro',
    'admin@scouts.com',
    'Admin',
    '$2b$10$0L6e.aIFvzXPzg5F4eFnR.EBPf1vRXN.Z7V7FX4FvDvPm3Rg/d9s2',
    true
)
ON CONFLICT (ci) DO NOTHING;

INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin)
VALUES (
    '1111111',
    'Patrón',
    'Principal',
    'patron@scouts.com',
    'Administración',
    '$2b$10$h9/vFNPspQs8pzUxV7ixW.h8zfQ9E1TjV7xW6J7DsM5RYfQ8K2E8m',
    true
)
ON CONFLICT (ci) DO NOTHING;

-- Verificar que se crearon
SELECT ci, nombre, apellido, email, is_admin FROM dirigente
WHERE is_admin = true
ORDER BY ci;

-- ============================================
-- RESUMEN DE TABLAS CREADAS
-- ============================================

-- \dt (en psql para ver todas las tablas)

```

---

## ✅ CREDENCIALES CREADAS

```
ADMIN:              CI: 8637944   Pass: admin123   Email: admin@scouts.com
PATRÓN:             CI: 1111111   Pass: patron123  Email: patron@scouts.com
```

---

## 🎯 PASOS:

1. **Copia EL BLOQUE SQL de arriba**
2. **Abre Railway Console**: PostgreSQL → Connect → Console
3. **Pega TODO**
4. **Presiona Enter/Execute**
5. **Espera a que termine** (1-2 minutos)
6. **Verifica**: Deberías ver 2 registros (admin + patrón)

---

## ✨ SI ALGO FALLA

Copiar y pegar la sección que falló de nuevo (es idempotente, tiene IF NOT EXISTS).
