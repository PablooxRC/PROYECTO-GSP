# 👤 GUÍA: USUARIOS ADMIN Y PATRÓN (Creación Automática)

**Versión**: 1.0  
**Fecha**: 24 de Marzo de 2026  
**Propósito**: Explicar cómo se crean automáticamente los usuarios al desplegar

---

## 🎯 RESUMEN RÁPIDO

Cuando ejecutas las migraciones de la BD, se crean automáticamente **2 usuarios admin**:

```
✅ ADMIN PRINCIPAL
   CI:       8637944
   Nombre:   Pablo Rodriguez Castro
   Email:    admin@scouts.com
   Password: admin123
   Rol:      Super Admin (is_admin = true)

✅ PATRÓN
   CI:       1111111
   Nombre:   Patrón Principal
   Email:    patron@scouts.com
   Password: patron123
   Rol:      Admin (is_admin = true)
```

---

## 📍 DÓNDE SE DEFINE

El archivo de migración que crea estos usuarios es:

**`database/migration_seed_admin_and_patron.sql`**

Este archivo se ejecuta automáticamente cuando corres:

```bash
for file in database/migration_*.sql; do
  psql -h localhost -U scout_user -d scouts_db < "$file"
done
```

---

## 🔄 CÓMO FUNCIONA

### 1. Archivo SQL de Seed

```sql
-- Hash bcrypt de "admin123"
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
```

**Nota**: La contraseña está hasheada con bcrypt para seguridad.

### 2. Validación

El SQL verifica si el usuario ya existe con `ON CONFLICT (ci) DO NOTHING`:

- Si el CI ya existe → No hace nada (evita duplicados)
- Si es nuevo → Crea el usuario

### 3. Verificación

Después de las migraciones, puedes verificar:

```bash
psql -h localhost -U scout_user -d scouts_db

# En consola psql:
SELECT ci, nombre, apellido, email, is_admin FROM dirigente
WHERE is_admin = true
ORDER BY ci;

# Salida esperada:
#    ci    | nombre  | apellido   |      email       | is_admin
# --------+---------+----------+------------------+----------
#  8637944| Pablo   | Rodriguez  | admin@scouts.com | t
#  1111111| Patrón  | Principal  | patron@scouts.com| t
```

---

## 🔐 SEGURIDAD: Hashes de Contraseñas

Las contraseñas NO están en texto plano, están hasheadas:

| Usuario | Contraseña | Hash bcrypt      |
| ------- | ---------- | ---------------- |
| Admin   | admin123   | `$2b$10$0L6e...` |
| Patrón  | patron123  | `$2b$10$h9/v...` |

**Cómo se generaron:**

```javascript
const bcrypt = require("bcrypt");
const hash = await bcrypt.hash("admin123", 10);
// Resultado: $2b$10$0L6e.aIFvzXPzg5F4eFnR.EBPf1vRXN.Z7V7FX4FvDvPm3Rg/d9s2
```

---

## 🛠️ PERSONALIZACIÓN

### ¿Quiero cambiar los datos del Admin?

**Opción 1: Editar el archivo SQL antes de desplegar**

Abre `database/migration_seed_admin_and_patron.sql` y cambia:

```sql
INSERT INTO dirigente (ci, nombre, apellido, email, unidad, password, is_admin)
VALUES (
    8637944,           -- ← Cambiar CI
    'Pablo',           -- ← Cambiar nombre
    'Rodriguez Castro',-- ← Cambiar apellido
    'admin@scouts.com',-- ← Cambiar email
    'Admin',           -- ← Cambiar unidad
    '$2b$10$...',      -- ← Cambiar password (dejar hash bcrypt)
    true
)
```

**Opción 2: Cambiar después de desplegar**

```bash
# Conectar a BD
psql -h localhost -U scout_user -d scouts_db

# Cambiar contraseña (el hash debe ser bcrypt)
UPDATE dirigente
SET nombre = 'Nuevo Nombre',
    email = 'nuevo@email.com'
WHERE ci = 8637944;
```

---

## 🔑 GENERAR NUEVOS HASHES BCRYPT

Si quieres cambiar las contraseñas, necesitas generar nuevos hashes.

### Método 1: Node.js (Recomendado)

```bash
# En la VM o tu máquina con Node.js

node << 'EOF'
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'mi_nueva_password_123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  console.log('SQL:');
  console.log(`UPDATE dirigente SET password = '${hash}' WHERE ci = 8637944;`);
}

generateHash();
EOF
```

**Salida:**

```
Hash: $2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXX
SQL:
UPDATE dirigente SET password = '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXX' WHERE ci = 8637944;
```

### Método 2: Online (NO RECOMENDADO para producción)

Usa un generador online en: https://bcrypt.online/

⚠️ **Advertencia**: No uses generadores online para contraseñas reales. Mejor usar Node.js localmente.

---

## 📊 CONSULTAS SQL ÚTILES

### Ver todos los admins

```sql
SELECT ci, nombre, apellido, email, is_admin FROM dirigente
WHERE is_admin = true;
```

### Ver todos los dirigentes (incluyendo no-admins)

```sql
SELECT ci, nombre, apellido, email, is_admin FROM dirigente
ORDER BY ci;
```

### Cambiar contraseña de un admin

```sql
-- Primero genera el hash con Node.js (ver arriba)
-- Luego ejecuta:
UPDATE dirigente
SET password = '$2b$10$NUEVA_HASH_AQUI'
WHERE ci = 8637944;
```

### Hacer admin a un usuario existente

```sql
UPDATE dirigente
SET is_admin = true
WHERE ci = 1234567;
```

### Cambiar email

```sql
UPDATE dirigente
SET email = 'nuevo@email.com'
WHERE ci = 8637944;
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Se crean automáticamente cada vez que despliego?

**No**. El SQL tiene `ON CONFLICT (ci) DO NOTHING`, lo que significa:

- **Primera vez**: Se crean
- **Siguientes veces**: Se ignoran (no duplican)

### ¿Qué pasa si borro un admin y vuelvo a desplegar?

Si ejecutas las migraciones de nuevo:

1. El usuario sigue borrado (ya no existe)
2. El `ON CONFLICT` no recreará (porque no existe el conflict)
3. **No se recrea automáticamente**

### ¿Puedo tener más de 2 admins?

**Sí**. Hay dos formas:

1. Agregar más registros a `migration_seed_admin_and_patron.sql`
2. Crear usuarios desde la app (si tiene esa funcionalidad)
3. Hacer admin a un usuario existente con UPDATE

### ¿Dónde están almacenadas las contraseñas?

En la tabla `dirigente`, columna `password`, en formato bcrypt:

```sql
SELECT ci, nombre, password FROM dirigente WHERE is_admin = true;
```

### ¿Cómo valida el login?

```javascript
// En el backend (src/controllers/login.js)
const isMatch = await bcrypt.compare(passwordIngresada, passwordEnBD);
if (isMatch) {
  // Autenticación exitosa
} else {
  // Autenticación fallida
}
```

---

## 🚀 FLUJO COMPLETO

```
1. Ejecutas migraciones
   ↓
2. migration_seed_admin_and_patron.sql se ejecuta
   ↓
3. Se intenta insertar Admin (CI: 8637944)
   - Si no existe → Se crea ✅
   - Si existe → Se ignora (ON CONFLICT)
   ↓
4. Se intenta insertar Patrón (CI: 1111111)
   - Si no existe → Se crea ✅
   - Si existe → Se ignora (ON CONFLICT)
   ↓
5. Ambos usuarios están en BD listos para usar
```

---

## 📝 CHECKLIST DE SEGURIDAD

```
☑ Las contraseñas están hasheadas (bcrypt)
☑ No hay texto plano en la BD
☑ No hay texto plano en git (están en SQL con hashes)
☑ ON CONFLICT previene duplicados
☑ Los CIs son únicos (PRIMARY KEY)
☑ El email es único (UNIQUE constraint)
```

---

## 🎯 PRÓXIMOS PASOS

1. **Primer despliegue**: Las migraciones crean automáticamente los 2 admins
2. **Usar las credenciales**: Haz login en la app
3. **Cambiar contraseñas**: Por seguridad, cambiar desde la app o con UPDATE SQL
4. **Agregar más admins**: Desde la app o manualmente en BD

---

## 📞 SOPORTE

Si tienes dudas sobre los usuarios:

1. Ver los datos creados:

   ```sql
   SELECT * FROM dirigente WHERE is_admin = true;
   ```

2. Leer el archivo SQL:

   ```
   database/migration_seed_admin_and_patron.sql
   ```

3. Consultar documentación de bcrypt:
   ```
   https://github.com/kelektiv/node.bcrypt.js
   ```

---

**✅ Los usuarios admin y patrón se crean automáticamente cuando despliegas**

Fecha: 24 de Marzo de 2026
