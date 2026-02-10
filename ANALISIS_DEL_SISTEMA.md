# 📊 ANÁLISIS COMPLETO DEL SISTEMA

## 1. ARQUITECTURA GENERAL

El sistema es una aplicación **Full Stack** con arquitectura cliente-servidor:

```
Frontend (React + Vite)  ←→  Backend (Express/Node.js)  ←→  Base de Datos (PostgreSQL)
```

### Stack Tecnológico:

- **Backend**: Express.js, Node.js, PostgreSQL
- **Frontend**: React 19, Vite, Tailwind CSS, React Router DOM
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Zod (esquemas)
- **Base de Datos**: PostgreSQL

---

## 2. ESTRUCTURA DE LA BASE DE DATOS

### Tabla `dirigente` (Usuarios/Líderes)

```sql
CREATE TABLE dirigente (
    ci INTEGER PRIMARY KEY,           -- Cédula de identidad (PK)
    nombre VARCHAR(200) NOT NULL,
    apellido VARCHAR(200) NOT NULL,
    unidad VARCHAR(200) NOT NULL,     -- Unidad Scout
    password VARCHAR(200) NOT NULL,   -- Hash bcrypt
    email VARCHAR(200) UNIQUE NOT NULL,
    gravatar VARCHAR(250),            -- URL de imagen random
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upadate_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `scouts` (Miembros Scout)

```sql
CREATE TABLE scouts (
    ci PRIMARY KEY,                   -- Cédula de identidad (PK)
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    rama VARCHAR(255) NOT NULL,       -- Rama scout (Castores, Scouts, Pioneros, etc.)
    unidad VARCHAR(255) NOT NULL,
    etapa VARCHAR(255) NOT NULL,      -- Etapa del scout
    nivel actual VARCHAR(255),        -- Nivel actual
    logros INTEGER,                   -- Cantidad de logros
    dirigente_ci INTEGER,             -- FK a dirigente (propietario)
    puntaje NUMERIC,                  -- Campo para puntaje (agregado)
    preguntas_mal_contestadas INTEGER -- Campo para preguntas incorrectas (agregado)
);
```

**Relación**: Un dirigente puede tener muchos scouts (1:N)

---

## 3. BACKEND - ARQUITECTURA EXPRESS

### 3.1 Flujo de Solicitudes

```
Cliente → Express App → Middleware → Rutas → Controlador → BD → Respuesta JSON
```

### 3.2 Middlewares

| Middleware       | Ubicación              | Función                                      |
| ---------------- | ---------------------- | -------------------------------------------- |
| `cors`           | app.js                 | Permite requests desde http://localhost:5173 |
| `morgan`         | app.js                 | Logger de requests                           |
| `cookieParser`   | app.js                 | Parsea cookies                               |
| `express.json()` | app.js                 | Parsea JSON                                  |
| `isAuth`         | auth.middleware.js     | **Valida JWT del token en cookies**          |
| `validateSchema` | validate.middleware.js | Valida request body con Zod                  |

### 3.3 Rutas y Controladores

#### 🔐 Autenticación (`/api/auth.routes.js`)

| Método | Ruta       | Middleware     | Función                                       |
| ------ | ---------- | -------------- | --------------------------------------------- |
| POST   | `/signin`  | validateSchema | **Login**: valida email/password, retorna JWT |
| POST   | `/signup`  | validateSchema | **Registro**: crea dirigente, retorna JWT     |
| POST   | `/signout` | -              | **Logout**: limpia cookie de token            |
| GET    | `/profile` | isAuth         | Obtiene perfil del dirigente autenticado      |

**Controlador**: [src/controllers/auth.controller.js](src/controllers/auth.controller.js)

- `signin()`: Busca dirigente por email, verifica contraseña (bcrypt), crea token JWT
- `signup()`: Hash de password, inserta en BD, crea token JWT
- `signout()`: Limpia cookie de token
- `profile()`: Retorna datos del dirigente desde token

#### 📋 Scouts (`/api/scout.routes.js`)

| Método | Ruta         | Middleware             | Función                                  |
| ------ | ------------ | ---------------------- | ---------------------------------------- |
| GET    | `/scouts`    | isAuth                 | Obtiene scouts del dirigente autenticado |
| GET    | `/scout/:ci` | isAuth                 | Obtiene un scout específico              |
| POST   | `/scout`     | isAuth, validateSchema | Crea nuevo scout                         |
| PUT    | `/scout/:ci` | isAuth, validateSchema | Actualiza scout                          |
| DELETE | `/scout/:ci` | isAuth                 | Elimina scout                            |

**Controlador**: [src/controllers/scout.controller.js](src/controllers/scout.controller.js)

- `getScouts()`: `SELECT * FROM scouts WHERE dirigente_ci = $1`
- `getScout()`: `SELECT * FROM scouts WHERE ci = $1`
- `createScout()`: Inserta scout vinculado al dirigente autenticado
- `updateScout()`: Actualiza datos del scout
- `deleteScout()`: Elimina scout

### 3.4 Sistema de Autenticación (JWT)

**Ubicación**: [src/libs/jwt.js](src/libs/jwt.js)

```javascript
// Token payload: { ci: number }
// Secret: 'xyz123'
// Expiración: 1 día
// Cookie: "token" (secure, sameSite: none)
```

**Verificación**: [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js)

- Extrae token de cookies
- Verifica JWT
- Asigna `req.userCI` y `req.userUnidad` (aunque userUnidad no se usa realmente)

### 3.5 Validación de Esquemas (Zod)

**Auth Schema** ([src/schemas/auth.schema.js](src/schemas/auth.schema.js)):

- `signinSchema`: email (válido) + password (6+ caracteres)
- `signupSchema`: ci + nombre + apellido + email + password + unidad

**Scout Schema** ([src/schemas/scout.schema.js](src/schemas/scout.schema.js)):

- `createScoutSchema`: ci + nombre + apellido + rama + unidad + etapa
- `updateScoutSchema`: Todos los campos opcionales

### 3.6 Configuración

**BD**: PostgreSQL en localhost:5432

```javascript
// db.js
const pool = new pg.Pool({
  port: 5432,
  host: "localhost",
  user: "postgres",
  password: "12345678",
  database: "Scouts",
});
```

**Server**: Puerto 3000

---

## 4. FRONTEND - ARQUITECTURA REACT

### 4.1 Estructura de Carpetas

```
frontend/src/
├── App.jsx                    # Componente raíz
├── main.jsx                   # Entry point
├── api/
│   ├── axios.js              # Instancia de axios configurada
│   └── scout.api.js          # Funciones para llamadas de scouts
├── components/
│   ├── ProtectedRoute.jsx    # Componente para rutas protegidas
│   ├── navbar/
│   │   ├── Navbar.jsx
│   │   └── navigation.js
│   ├── scouts/
│   │   └── ScoutsCard.jsx
│   └── ui/                   # Componentes reutilizables
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── Label.jsx
│       └── Textscout.jsx
├── context/
│   ├── AuthContext.jsx       # Contexto de autenticación
│   └── scoutContex.jsx       # Contexto de scouts
└── pages/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── ProfilePage.jsx
    ├── ScoutsPage.jsx        # Página principal de scouts
    ├── ScoutFormPage.jsx     # Crear/editar scout
    └── NotFound.jsx
```

### 4.2 Contextos Globales

#### 🔐 AuthContext ([src/context/AuthContext.jsx](src/context/AuthContext.jsx))

**Estados**:

```javascript
{
    user: null | { ci, nombre, apellido, email, unidad, gravatar, ... },
    isAuth: boolean,
    errors: null | string[],
    loading: boolean
}
```

**Funciones**:

- `signin(data)`: POST /signin → Autentifica con email/password
- `signup(data)`: POST /signup → Registra nuevo dirigente
- `signout()`: POST /signout → Cierra sesión
- `checkLogin()`: GET /profile → Valida token al cargar la app

**Flujo**:

1. Al cargar la app, obtiene token de `js-cookie`
2. Si existe token, verifica con `/profile`
3. Si es válido, establece usuario como autenticado
4. Token se guarda en cookie automáticamente después de signin/signup

#### 📋 ScoutContext ([src/context/scoutContex.jsx](src/context/scoutContex.jsx))

**Estados**:

```javascript
{
    scouts: [],
    errors: []
}
```

**Funciones**:

- `loadscouts()`: GET /scouts → Obtiene scouts del dirigente
- `createScout(scout)`: POST /scout → Crea nuevo scout
- `deleteScout(ci)`: DELETE /scout/:ci → Elimina scout
- `getScout(ci)`: GET /scout/:ci → Obtiene un scout
- `updateScout(ci, scout)`: PUT /scout/:ci → Actualiza scout

### 4.3 Instancia Axios ([src/api/axios.js](src/api/axios.js))

```javascript
axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Envía cookies automáticamente
});
```

**Llamadas de API** ([src/api/scout.api.js](src/api/scout.api.js)):

```javascript
export const createScoutRequest = (scout) => axios.post("/scout", scout);
export const getScoutsRequest = () => axios.get("/scouts");
export const deleteScoutRequest = (ci) => axios.delete(`/scout/${ci}`);
export const getScoutRequest = (ci) => axios.get(`/scout/${ci}`);
export const updateScoutRequest = (ci, scout) =>
  axios.put(`/scout/${ci}`, scout);
```

### 4.4 Páginas Principales

#### 📱 ScoutsPage.jsx

- Obtiene lista de scouts del contexto
- Muestra cards con info: nombre, apellido, C.I., puntaje, preguntas mal contestadas
- Botón "Imprimir Reporte de Scouts" (genera PDF con tabla HTML)
- Botones de Editar y Eliminar por scout
- Muestra unidad del dirigente en encabezado

#### 📝 ScoutFormPage.jsx

- Crear o editar scout
- Formulario con: nombre, apellido, C.I., rama, unidad, etapa
- Al editar, obtiene datos del scout y pre-llena formulario

#### 🔑 LoginPage.jsx

- Email y password
- Llama a `signin()` del contexto

#### ✍️ RegisterPage.jsx

- Registro: C.I., nombre, apellido, email, unidad, password
- Llama a `signup()` del contexto

#### 👤 ProfilePage.jsx

- Muestra datos del usuario autenticado

### 4.5 Componentes Reutilizables

- `Button.jsx`: Botón personalizable
- `Card.jsx`: Contenedor de contenido
- `Input.jsx`: Campo de entrada
- `Label.jsx`: Etiqueta
- `Textscout.jsx`: Campo de texto especializado para scouts
- `ProtectedRoute.jsx`: Protege rutas si no está autenticado

---

## 5. FLUJO DE DATOS

### 5.1 Autenticación (Sign In)

```
LoginPage → signin(email, password)
    ↓
axios.post('/signin', { email, password })
    ↓
Backend: auth.controller.signin()
    ↓
Valida email → Valida contraseña → Crea JWT
    ↓
Retorna usuario + SET cookie "token"
    ↓
Frontend: AuthContext setUser() + setIsAuth(true)
    ↓
Redirige a HomePage
```

### 5.2 Crear Scout

```
ScoutFormPage → createScout(scoutData)
    ↓
axios.post('/scout', scoutData) + Token en cookie
    ↓
Backend: auth.middleware valida JWT
    ↓
scout.controller.createScout() → INSERT con dirigente_ci
    ↓
Retorna scout creado
    ↓
Frontend: ScoutContext agrega scout a lista
    ↓
Redirige a ScoutsPage
```

### 5.3 Obtener Scouts

```
ScoutsPage useEffect()
    ↓
loadscouts()
    ↓
axios.get('/scouts') + Token en cookie
    ↓
Backend: auth.middleware valida JWT
    ↓
scout.controller.getScouts() → SELECT WHERE dirigente_ci = :userCI
    ↓
Retorna array de scouts
    ↓
Frontend: ScoutContext setScouts(data)
    ↓
Renderiza cards de scouts
```

---

## 6. CARACTERÍSTICAS ACTUALES

### ✅ Funcionales

1. **Autenticación de Dirigentes**
   - Login/Register con email y contraseña
   - JWT token persistente en cookies
   - Cierre de sesión

2. **Gestión de Scouts**
   - CRUD completo (Crear, Leer, Actualizar, Eliminar)
   - Cada dirigente solo ve sus scouts
   - Campos: nombre, apellido, C.I., rama, unidad, etapa

3. **Datos Adicionales**
   - Puntaje (score)
   - Preguntas mal contestadas

4. **Reportes**
   - Imprimir reporte de scouts en HTML

5. **UI/UX**
   - Componentes reutilizables con Tailwind CSS
   - Validación de formularios con Zod
   - Manejo de errores con contextos

---

## 7. CONSIDERACIONES IMPORTANTES

### 🔒 Seguridad

**⚠️ PROBLEMAS ACTUALES:**

1. Secret JWT hardcodeado: `'xyz123'` → Usar variables de entorno
2. Cookie con `secure: true` pero sin `httpOnly` → Vulnerable a XSS
3. Credenciales de BD en texto plano → Usar variables de entorno
4. CORS abierto solo a localhost pero en producción será diferente
5. Password en cookies sin encriptación (solo en JWT que está encriptado)

### 🗂️ Estructura de Datos

**Campos Agregados sin Migración:**

- `puntaje`
- `preguntas_mal_contestadas`

Estos campos existen en la aplicación pero no en la creación inicial de tabla.

### 📡 API Endpoints Resumen

```
POST   /api/signin              → Autenticar
POST   /api/signup             → Registrar
POST   /api/signout            → Logout
GET    /api/profile            → Perfil del dirigente

GET    /api/scouts             → Listar scouts del dirigente
GET    /api/scout/:ci          → Obtener scout
POST   /api/scout              → Crear scout
PUT    /api/scout/:ci          → Actualizar scout
DELETE /api/scout/:ci          → Eliminar scout
```

---

## 8. PUNTOS CLAVE PARA AGREGAR NUEVAS CARACTERÍSTICAS

### ✅ Checklist de Verificación

1. **Base de Datos**
   - ¿Necesita nuevas tablas o columnas?
   - ¿Hay relaciones con tablas existentes?
   - Ejecutar migrations SQL correctamente

2. **Backend**
   - Crear controlador si es nueva entidad
   - Crear rutas en `routes/`
   - Crear validación de esquema en `schemas/`
   - Vincular middleware `isAuth` si requiere autenticación
   - Filtrar por `req.userCI` para aislar datos del usuario

3. **Frontend**
   - ¿Crear nuevo contexto o usar existente?
   - Crear página si es nueva sección
   - Crear componentes reutilizables
   - Agregar rutas en `App.jsx` con `ProtectedRoute` si es privada
   - Usar contexto `AuthContext` para usuario actual

4. **Validación**
   - Backend: Zod schemas
   - Frontend: React Hook Form
   - Manejo de errores consistente

5. **Testing**
   - Verificar que rutas existentes sigan funcionando
   - Probar con el usuario autenticado correcto
   - Validar aislamiento de datos entre usuarios

---

## 9. DEPENDENCIAS CLAVE

### Backend

- `express` - Framework web
- `pg` - Driver PostgreSQL
- `jsonwebtoken` - JWT
- `bcrypt` - Hash de contraseñas
- `zod` - Validación de esquemas
- `express-promise-router` - Manejo de promesas en rutas
- `cors` - CORS
- `cookie-parser` - Parseo de cookies
- `morgan` - Logger

### Frontend

- `react` - Framework UI
- `react-router-dom` - Routing
- `axios` - Cliente HTTP
- `react-hook-form` - Manejo de formularios
- `js-cookie` - Manipulación de cookies
- `tailwindcss` - Estilos CSS
- `react-icons` - Iconos

---

## 10. PRÓXIMOS PASOS RECOMENDADOS

1. **Documentar** las nuevas características deseadas
2. **Listar** campos y relaciones de datos necesarias
3. **Diseñar** esquemas SQL para nuevas tablas
4. **Validar** que no afecte estructura existente
5. **Implementar** backend primero (BD → API)
6. **Implementar** frontend (UI → Contexto → API)
7. **Testear** con usuarios existentes para verificar aislamiento de datos
