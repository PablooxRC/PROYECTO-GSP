# 🎯 REFERENCIA RÁPIDA (Cheat Sheet)

## 🚀 Inicia el Proyecto

```bash
# Terminal 1: Backend
cd "d:\\PROYECTO DE GRADO 2025\\Software"
npm run dev

# Terminal 2: Frontend
cd "d:\\PROYECTO DE GRADO 2025\\Software\\frontend"
npm run dev

# Base de datos debe estar corriendo en localhost:5432
```

URL local: `http://localhost:5173`

---

## 🔐 Autenticación

### Login en Backend

```
POST /api/signin
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}

Response:
200 OK
Set-Cookie: token=eyJ...
{
  "ci": 123,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "user@example.com",
  "unidad": "Unidad A",
  "gravatar": "https://..."
}
```

### Logout

```
POST /api/signout

Response:
200 OK
Set-Cookie: token=; maxAge=0
```

### Obtener Perfil (requiere JWT)

```
GET /api/profile
Cookie: token=eyJ...

Response:
200 OK
{
  "ci": 123,
  "nombre": "Juan",
  ...
}
```

---

## 📋 Endpoints Scouts

### Listar Scouts del Dirigente

```
GET /api/scouts
Cookie: token=eyJ...

Response:
200 OK
[
  {
    "ci": 111111,
    "nombre": "Scout",
    "apellido": "Ejemplo",
    "rama": "Scouts",
    "unidad": "Unidad A",
    "etapa": "Principiante",
    "puntaje": 85,
    "preguntas_mal_contestadas": 2,
    "dirigente_ci": 123
  },
  ...
]
```

### Crear Scout

```
POST /api/scout
Cookie: token=eyJ...
Content-Type: application/json

{
  "ci": 111111,
  "nombre": "Scout",
  "apellido": "Nuevo",
  "rama": "Scouts",
  "unidad": "Unidad A",
  "etapa": "Principiante"
}

Response:
200 OK
{
  "ci": 111111,
  "nombre": "Scout",
  "apellido": "Nuevo",
  ...
  "dirigente_ci": 123
}
```

### Actualizar Scout

```
PUT /api/scout/111111
Cookie: token=eyJ...
Content-Type: application/json

{
  "nombre": "Scout",
  "apellido": "Actualizado",
  "rama": "Scouts",
  "unidad": "Unidad B",
  "etapa": "Avanzado"
}

Response:
200 OK
{
  "ci": 111111,
  "nombre": "Scout",
  "apellido": "Actualizado",
  ...
}
```

### Eliminar Scout

```
DELETE /api/scout/111111
Cookie: token=eyJ...

Response:
200 OK
"Scout 111111 eliminado"
```

---

## 🗄️ Principales Tablas BD

### Dirigente

```sql
SELECT * FROM dirigente WHERE ci = 123;

| ci  | nombre | apellido | email           | unidad     | password_hash | gravatar | created_at          |
|-----|--------|----------|-----------------|------------|---------------|----------|---------------------|
| 123 | Juan   | Pérez    | juan@example.com| Unidad A   | $2b$10$...    | https:..| 2025-02-09 10:00:00|
```

### Scouts

```sql
SELECT * FROM scouts WHERE dirigente_ci = 123;

| ci      | nombre | apellido | rama    | unidad   | etapa        | puntaje | preguntas_mal_contestadas | dirigente_ci |
|---------|--------|----------|---------|----------|--------------|---------|---------------------------|--------------|
| 111111  | Scout1 | Ejemplo  | Scouts  | Unidad A | Principiante | 85      | 2                         | 123          |
| 222222  | Scout2 | Test     | Castores| Unidad A | Intermedio   | 92      | 1                         | 123          |
```

---

## 🔗 Contextos React

### AuthContext

```javascript
const {
  user, // { ci, nombre, apellido, email, unidad, ... } | null
  isAuth, // true si está logueado
  errors, // [] de mensajes de error
  loading, // true mientras verifica sesión inicial
  signin, // async (email, pwd) => user | null
  signup, // async (ci, nombre, email, pwd, unidad) => user | null
  signout, // async () => void
} = useAuth();
```

### ScoutContext

```javascript
const {
  scouts, // [] de scouts del usuario
  errors, // [] de errores
  loadscouts, // async () => void
  createScout, // async (scout) => Scout | null
  updateScout, // async (ci, scout) => Scout | null
  deleteScout, // async (ci) => void
  loadScout, // async (ci) => Scout | null
  getScout, // (ci) => Scout | undefined
  setErrors, // (errors) => void
} = useScout();
```

---

## 🛡️ Seguridad - Lo Más Importante

### ✅ SIEMPRE hacer

```javascript
// Backend: Filtrar por usuario
WHERE dirigente_ci = $1, [req.userCI]

// Backend: Proteger ruta
router.get('/items', isAuth, getItems);

// Frontend: Usar ProtectedRoute
<Route element={<ProtectedRoute />}>
  <Route path="/scouts" element={<ScoutsPage />} />
</Route>
```

### ❌ NUNCA hacer

```javascript
// ❌ Traer todos los datos sin filtro
SELECT * FROM scouts;

// ❌ Ruta sin autenticación
router.get('/items', getItems);

// ❌ Dejar ruta pública si debería ser privada
<Route path="/scouts" element={<ScoutsPage />} />

// ❌ Confiar en ID del cliente
// Siempre validar en backend: WHERE id = $1 AND user_id = $2
```

---

## 📁 Estructura Carpetas Rápida

```
Backend:
src/
  controllers/    ← Lógica de negocio
  routes/         ← Definir endpoints
  schemas/        ← Validación Zod
  middlewares/    ← isAuth, validateSchema
  libs/           ← JWT, utilidades
  db.js           ← Pool de conexión PostgreSQL

Frontend:
src/
  context/        ← Estado global (Auth, Scout)
  pages/          ← Páginas principales
  components/     ← UI reutilizable
  api/            ← Llamadas axios
```

---

## 🔧 Agregar Nueva Característica - Checklist Rápido

```
[ ] 1. Crear tabla en BD (con FK a dirigente_ci)
[ ] 2. Crear controlador (con filtros WHERE)
[ ] 3. Crear schema Zod (validación)
[ ] 4. Crear rutas (con isAuth)
[ ] 5. Registrar rutas en app.js
[ ] 6. Crear API client (axios calls)
[ ] 7. Crear contexto React
[ ] 8. Crear página
[ ] 9. Agregar rutas en App.jsx
[ ] 10. Agregar provider en main.jsx
[ ] 11. Testear con usuario A y B
[ ] 12. Verificar aislamiento datos
```

**Tiempo estimado**: 2-4 horas por característica

---

## 🐛 Debugging Rápido

### El usuario A ve datos de usuario B

```
❌ Problema: WHERE sin filtro por usuario
✅ Solución: SELECT * FROM tabla WHERE ... AND dirigente_ci = $1
```

### Ruta retorna 401 "No autorizado"

```
❌ Problema: Token expirado o no válido
✅ Solución: Login nuevamente, revisa token en cookies
```

### Error 409 "Ya existe"

```
❌ Problema: Email duplicado o CI duplicado
✅ Solución: Usar email/CI diferente, revisa UNIQUE constraints
```

### Error 400 "Validation failed"

```
❌ Problema: Datos no cumplen schema Zod
✅ Solución: Revisa tipos y valores, frontend debería validar primero
```

### Scout no aparece en lista

```
❌ Problema: Se creó con dirigente_ci diferente
✅ Solución: Revisa que req.userCI sea correcto, verifica en BD
```

---

## 📊 Variables de Entorno (TODO)

Crear `.env` en raíz backend:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=12345678
DB_NAME=Scouts
JWT_SECRET=tu-secreto-muy-seguro-aqui
NODE_ENV=development
```

---

## 🧪 Testear Localmente

### Test 1: Aislamiento de Datos

```
1. Login como usuario A (dirigenteA@example.com)
2. Crear scout S1
3. Logout
4. Login como usuario B (dirigenteB@example.com)
5. Ver scouts → S1 NO debe aparecer
6. Logout
7. Login como usuario A → S1 debe aparecer
```

### Test 2: Protección de Rutas

```
1. Cerrar sesión (logout)
2. Intentar acceder a http://localhost:5173/scouts
3. Debe redirigir a /login
```

### Test 3: Validación

```
1. Intentar crear scout sin nombre → Debe rechazar
2. Intentar crear scout con CI duplicado → Debe rechazar
3. Login con email incorrecto → Debe rechazar
```

---

## 📱 Componentes Reutilizables

### Button

```jsx
import { Button } from "../components/ui/Button";

<Button className="bg-blue-600 hover:bg-blue-700" onClick={handleClick}>
  Click me
</Button>;
```

### Card

```jsx
import { Card } from "../components/ui/Card";

<Card className="p-4">
  <h1>Contenido</h1>
</Card>;
```

### Input

```jsx
import { Input } from "../components/ui/Input";

<Input
  type="text"
  placeholder="Escribe aquí..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>;
```

### Label

```jsx
import { Label } from '../components/ui/Label';

<Label>Nombre:</Label>
<Input />
```

---

## 🎨 Colores Tailwind Usados

```
Primario: blue-600, blue-700
Éxito: green-600
Error: red-500, red-600
Advertencia: yellow-500
Fondo: white, gray-50
Texto: gray-600, gray-800
```

---

## 📞 Comandos Útiles

### Base de Datos

```bash
# Conectar
psql -U postgres -d Scouts

# Ver tablas
\dt

# Ver scout de usuario 123
SELECT * FROM scouts WHERE dirigente_ci = 123;

# Ver dirigentes
SELECT ci, nombre, apellido, email, unidad FROM dirigente;

# Eliminar scout
DELETE FROM scouts WHERE ci = 111111;

# Ver estructura tabla
\d scouts
```

### Git

```bash
git status
git add .
git commit -m "Descripción de cambio"
git push
```

### NPM

```bash
npm install          # Instalar dependencias
npm run dev         # Dev mode
npm start           # Producción
npm run build       # Build frontend
npm run lint        # Lint code
```

---

## 🚨 Errores Comunes en 30 Segundos

| Error                           | Causa                         | Solución                            |
| ------------------------------- | ----------------------------- | ----------------------------------- |
| `Cannot POST /api/...`          | Ruta no existe                | Registrar en app.js                 |
| `Cannot read property 'scouts'` | Scout context no cargado      | Agregar ScoutProvider en main.jsx   |
| `401 Unauthorized`              | Token inválido/expirado       | Login nuevamente                    |
| `Cannot destructure 'useAuth'`  | Hook fuera de Provider        | Mover componente dentro de Provider |
| `Duplicate key value`           | Email o CI repetido           | Usar datos únicos                   |
| `User A ve datos de User B`     | WHERE sin filtro dirigente_ci | Agregar AND dirigente_ci = $1       |

---

## ✨ Pro Tips

1. **Devtools Redux**: Instala para ver estado React
2. **Postman**: Usa para testear APIs sin frontend
3. **VS Code REST Client**: Crea `.http` para testear sin Postman
4. **Chrome DevTools**: F12 → Network para ver requests/responses
5. **Console logs**: Importante en JWT para debuggear
6. **Git blame**: git blame archivo.js → ver quién cambió qué

---

## 🎓 Ejercicios Prácticos

### Ejercicio 1: Agregar campo "edad" a scouts

- Modifica tabla BD (ALTER TABLE scouts ADD COLUMN edad INT;)
- Actualiza schema Zod
- Actualiza controlador CRUD
- Actualiza frontend formulario
- Testea

**Tiempo**: 30 minutos

### Ejercicio 2: Agregar ruta "GET /scout/count"

- Cuenta scouts del usuario
- Retorna JSON con número
- Úsala en frontend

**Tiempo**: 20 minutos

### Ejercicio 3: Agregar validación email

- Backend: Verificar email válido
- Frontend: Validar antes de enviar
- Testear con emails inválidos

**Tiempo**: 30 minutos

---

## 📚 Documentación Completa

Estos cheat sheets son _cortos_. Para más detalles:

- **ANALISIS_DEL_SISTEMA.md** - Guía técnica completa
- **GUIA_AGREGAR_CARACTERISTICAS.md** - Paso a paso
- **DIAGRAMAS_Y_FLUJOS.md** - Visualizaciones
- **RESUMEN_EJECUTIVO.md** - Contexto general
- **INDICE_DOCUMENTACION.md** - Índice

---

**Última actualización**: 9 de febrero de 2026  
**Versión**: 1.0
