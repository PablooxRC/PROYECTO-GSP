# 📋 SQL CORREGIDO PARA FIXEAR LA BD EN RAILWAY

**Estos son los comandos que FALTARON. Copiar y pegar en Railway Console:**

```sql
-- ============================================
-- CREAR TABLA registros (CON TIPOS CORRECTOS YA)
-- ============================================

CREATE TABLE IF NOT EXISTS registros (
    id SERIAL PRIMARY KEY,
    scout_ci VARCHAR(20) NOT NULL REFERENCES scouts(ci) ON DELETE CASCADE,
    unidad VARCHAR(255),
    etapa_progresion VARCHAR(255),
    colegio VARCHAR(255),
    curso VARCHAR(255),
    numero_deposito VARCHAR(255),
    fecha_deposito DATE,
    hora_deposito TIME,
    monto NUMERIC(10, 2),
    envio VARCHAR(500),
    contacto_parentesco VARCHAR(255),
    contacto_nombre VARCHAR(255),
    contacto_celular VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dirigente_ci VARCHAR(50) NOT NULL REFERENCES dirigente(ci)
);

CREATE INDEX IF NOT EXISTS idx_registros_scout_ci ON registros(scout_ci);
CREATE INDEX IF NOT EXISTS idx_registros_dirigente_ci ON registros(dirigente_ci);
CREATE INDEX IF NOT EXISTS idx_registros_fecha_deposito ON registros(fecha_deposito);

-- ============================================
-- CREAR TABLA report_logs (CON TIPOS CORRECTOS YA)
-- ============================================

CREATE TABLE IF NOT EXISTS report_logs (
  id SERIAL PRIMARY KEY,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_by VARCHAR(50) REFERENCES dirigente(ci),
  "from" DATE,
  "to" DATE,
  recipient_email VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_report_logs_sent_at ON report_logs(sent_at);

-- ============================================
-- VERIFICAR TABLAS CREADAS
-- ============================================

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- VERIFICAR USUARIOS ADMIN
-- ============================================

SELECT ci, nombre, apellido, email, is_admin FROM dirigente
WHERE is_admin = true
ORDER BY ci;
```

---

## ✅ DESPUÉS DE PEGAR Y EJECUTAR:

Deberías ver:

- ✅ Tabla `registros` creada
- ✅ Tabla `report_logs` creada
- ✅ Todas las tablas listadas
- ✅ 2 admins (8637944, 1111111)

---

## 🎯 PRÓXIMOS PASOS:

1. ✅ Pega y ejecuta esto
2. ✅ Verifica que funcione
3. 🔄 Luego configuramos el backend en Railway
4. 🔄 Y frontend en Netlify
