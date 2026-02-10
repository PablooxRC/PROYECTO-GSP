# 🗺️ DIAGRAMAS Y ARQUITECTURA DEL SISTEMA

## 1. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (NAVEGADOR)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     FRONTEND (React)                      │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │ LoginPg  │  │ ScoutsPg │  │ ProfilePg│               │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘               │   │
│  │       │             │             │                      │   │
│  │  ┌────▼─────────────▼─────────────▼─────┐               │   │
│  │  │      React Router (Routing)           │               │   │
│  │  │  - ProtectedRoute                     │               │   │
│  │  │  - Public routes                      │               │   │
│  │  └──────────────┬────────────────────────┘               │   │
│  │                 │                                        │   │
│  │  ┌──────────────▼──────────────────────┐               │   │
│  │  │    Global State (Context API)       │               │   │
│  │  │  ┌──────────┬──────────┐            │               │   │
│  │  │  │AuthCtx  │ScoutCtx  │            │               │   │
│  │  │  └──────────┴──────────┘            │               │   │
│  │  └──────────────┬──────────────────────┘               │   │
│  │                 │                                        │   │
│  │  ┌──────────────▼──────────────────────┐               │   │
│  │  │    API Client (axios)                │               │   │
│  │  │    baseURL: /api                     │               │   │
│  │  │    credentials: true                 │               │   │
│  │  └──────────────┬──────────────────────┘               │   │
│  │                 │                                        │   │
│  └─────────────────┼──────────────────────────────────────┘   │
│                    │                                           │
└────────────────────┼───────────────────────────────────────────┘
                     │ HTTP + JWT en Cookie
                     │ http://localhost:3000
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Express App                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Middlewares                                        │  │   │
│  │  │ - cors, morgan, cookieParser, express.json        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                      │                                    │   │
│  │  ┌───────────────────▼────────────────────┐            │   │
│  │  │         Router (Routes)                 │            │   │
│  │  │  ┌──────────┬────────────────────────┐  │            │   │
│  │  │  │Auth Routes    │Scout Routes       │  │            │   │
│  │  │  │/signin        │/scouts            │  │            │   │
│  │  │  │/signup        │/scout/:ci         │  │            │   │
│  │  │  │/signout       │[POST/PUT/DELETE]  │  │            │   │
│  │  │  │/profile       │                   │  │            │   │
│  │  │  └──────────┬────────────────────────┘  │            │   │
│  │  └────────────┼────────────────────────────┘            │   │
│  │               │                                          │   │
│  │  ┌────────────▼──────────────────────┐                 │   │
│  │  │ Middlewares en Rutas              │                 │   │
│  │  │ - isAuth (JWT validation)         │                 │   │
│  │  │ - validateSchema (Zod)            │                 │   │
│  │  └────────────┬─────────────────────┘                 │   │
│  │               │                                          │   │
│  │  ┌────────────▼──────────────────────┐                 │   │
│  │  │      Controllers                  │                 │   │
│  │  │ - auth.controller.js              │                 │   │
│  │  │ - scout.controller.js             │                 │   │
│  │  └────────────┬─────────────────────┘                 │   │
│  │               │                                          │   │
│  └───────────────┼──────────────────────────────────────┘   │
│                  │                                           │
└──────────────────┼───────────────────────────────────────────┘
                   │ SQL Queries
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Table: dirigente                                         │   │
│  │ ├─ ci (PK)                                               │   │
│  │ ├─ nombre, apellido                                      │   │
│  │ ├─ email (UNIQUE)                                        │   │
│  │ ├─ unidad                                                │   │
│  │ ├─ password (hashed)                                     │   │
│  │ └─ gravatar                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Table: scouts                                            │   │
│  │ ├─ ci (PK)                                               │   │
│  │ ├─ nombre, apellido                                      │   │
│  │ ├─ rama, etapa                                           │   │
│  │ ├─ unidad                                                │   │
│  │ ├─ puntaje                                               │   │
│  │ ├─ preguntas_mal_contestadas                             │   │
│  │ └─ dirigente_ci (FK → dirigente)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagrama de Flujo de Autenticación

```
┌─────────────────┐
│   Inicio App    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Obtiene token de js-cookie  │
└────────┬────────────────────┘
         │
    Hay token?
    /        \
  NO/         \SI
  /            \
 ▼             ▼
┌──────────┐  ┌──────────────────────────┐
│ No auth  │  │ axios.get('/profile')    │
│ user=null│  │ (con token en cookie)    │
│ loading  │  └──────────┬───────────────┘
│ =false   │             │
└──────────┘        ¿Válido?
                    /        \
                  SÍ          NO
                  /            \
                 ▼             ▼
          ┌──────────────┐ ┌──────────────┐
          │  setUser()   │ │ setUser(null)│
          │ isAuth=true  │ │ isAuth=false │
          │ loading=false│ │ Borra cookie │
          └──────────────┘ │ loading=false│
                           └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Renderiza UI │
                         │ (App ready)  │
                         └──────────────┘
```

---

## 3. Diagrama de Flujo: Crear Scout

```
┌──────────────────────┐
│  ScoutFormPage       │
│  (formulario vacío)  │
└─────────┬────────────┘
          │
          │ Usuario llena:
          │ - nombre
          │ - apellido
          │ - CI
          │ - rama
          │ - unidad
          │ - etapa
          │
          ▼
    ┌──────────────┐
    │ onClick      │
    │ "Guardar"    │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────────────┐
    │ createScout(scoutData)      │
    │ (desde ScoutContext)        │
    └──────┬──────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ POST /api/scout                  │
    │ {                                │
    │   ci, nombre, apellido,          │
    │   rama, unidad, etapa            │
    │ }                                │
    │ + Token en Cookie (automático)   │
    └──────┬───────────────────────────┘
           │
           ▼ (Backend)
    ┌──────────────────────────────┐
    │ auth.middleware: isAuth()    │
    │ - Valida JWT                 │
    │ - Asigna req.userCI          │
    └──────┬───────────────────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │ validateSchema() (Zod)       │
    │ - Valida createScoutSchema   │
    └──────┬───────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │ scout.controller.createScout()          │
    │ INSERT INTO scouts (...)                │
    │ VALUES (ci, nombre, ..., req.userCI)   │
    │                                         │
    │ ¿Errores?                              │
    │ - ci duplicado → 409 Conflict           │
    │ - Falla BD → 500 Error                  │
    └──────┬────────────────────────────────┘
           │
      ¿Éxito?
      /        \
    SÍ          NO
    /            \
   ▼              ▼
┌─────────────┐ ┌──────────────────┐
│ Retorna     │ │ Retorna error    │
│ { scout }   │ │ { message: "..." │
│ status 200  │ │ status 409/500   │
└──────┬──────┘ └──────┬───────────┘
       │               │
       ▼               ▼
┌──────────────────┐ ┌────────────────────┐
│ Frontend recibe  │ │ Frontend recibe    │
│ scout creado     │ │ error              │
└──────┬───────────┘ └──────┬─────────────┘
       │                    │
       ▼                    ▼
┌──────────────────────┐ ┌──────────────────────┐
│ Contexto agrega      │ │ Contexto setErrors() │
│ scout a lista        │ │ Muestra alerta       │
│ setScouts([...])     │ │ Usuario sigue viendo │
└──────┬───────────────┘ │ el formulario        │
       │                 └──────────────────────┘
       ▼
┌────────────────────────────┐
│ navigate('/scouts')        │
│ (Redirige a ScoutsPage)    │
└────────────────────────────┘
```

---

## 4. Diagrama: Obtener Scouts (Protección de Datos)

```
Dirigente A (ci=123)              Dirigente B (ci=456)
        │                                  │
        │                                  │
        ▼                                  ▼
    axios.get('/scouts')      axios.get('/scouts')
        │                                  │
        │                                  │
        └──────────────────┬───────────────┘
                           │
                    +─────────────+
                    │   Backend   │
                    +─────────────+
                           │
                           ▼
                    isAuth middleware
                    ├─ Dirigente A
                    │  req.userCI = 123
                    │
                    └─ Dirigente B
                       req.userCI = 456
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    controller.getScouts()

    SELECT * FROM scouts
    WHERE dirigente_ci = $1

        │                  │                  │
        ▼                  ▼                  ▼
    WHERE             WHERE             WHERE
    dirigente_ci      dirigente_ci      dirigente_ci
    = 123             = 456             = ???
        │                  │
        ▼                  ▼
    [Scout A1]        [Scout B1]
    [Scout A2]        [Scout B2]
        │                  │
        └─────────┬────────┘
                  ▼
        Cada usuario solo
        ve sus propios scouts

    ✓ Aislamiento de datos garantizado
      porque el middleware valida
      y asigna req.userCI correctamente
```

---

## 5. Diagrama: Relaciones de Tablas

```
┌──────────────────────────┐
│      dirigente           │
├──────────────────────────┤
│ PK  ci (INTEGER)         │
├──────────────────────────┤
│     nombre (VARCHAR)     │
│     apellido (VARCHAR)   │
│     email (VARCHAR UQ)   │
│     unidad (VARCHAR)     │
│     password (VARCHAR)   │
│     gravatar (VARCHAR)   │
│     created_at           │
│     updated_at           │
└──────────────────────────┘
         △
         │ (1 : N)
         │ FK dirigente_ci
         │
┌──────────────────────────┐
│      scouts              │
├──────────────────────────┤
│ PK  ci (VARCHAR)         │
├──────────────────────────┤
│     nombre (VARCHAR)     │
│     apellido (VARCHAR)   │
│     rama (VARCHAR)       │
│     unidad (VARCHAR)     │
│     etapa (VARCHAR)      │
│     puntaje (NUMERIC)    │
│     preguntas_mal_...    │
│  FK dirigente_ci         │
└──────────────────────────┘

Cardinalidad:
- 1 dirigente ─────────── N scouts
- Cada scout pertenece a exactamente 1 dirigente
- 1 dirigente puede tener 0 a muchos scouts
```

---

## 6. Ciclo de Vida del JWT Token

```
┌─────────────────────────────────────────────────────────────┐
│                  Token Lifecycle                             │
└─────────────────────────────────────────────────────────────┘

1. CREACIÓN (en signup/signin)
   ┌──────────────────────────┐
   │ createAccessToken()      │
   │ { ci: 123 }              │
   │ Secret: 'xyz123'         │
   │ Exp: 1 día               │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ eyJhbGciOiJIUzI1NiIsIn... │
   │ (JWT encriptado)         │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ res.cookie("token", jwt, {       │
   │   secure: true,                  │
   │   sameSite: "none",              │
   │   maxAge: 24*60*60*1000          │
   │ })                               │
   └────────┬─────────────────────────┘
            │
            ▼ (Se envía al cliente)
   ┌──────────────────────────┐
   │ Navegador guarda cookie  │
   │ "token": "eyJ..."        │
   └────────┬─────────────────┘
            │
2. USO (en cada request)
            │
            ▼
   ┌──────────────────────────────────┐
   │ axios envia automáticamente       │
   │ Cookie: token=eyJ...             │
   │ (withCredentials: true)          │
   └────────┬─────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ Backend: isAuth middleware       │
   │ token = req.cookies.token        │
   │ jwt.verify(token, 'xyz123')      │
   └────────┬─────────────────────────┘
            │
       ¿Válido?
       /      \
      SÍ        NO
      │         │
      ▼         ▼
   req.user  Error 401
   CI=123    "No authorized"
      │
      ▼
   ✓ Continúa

3. EXPIRACIÓN
   ┌──────────────────────────┐
   │ Después de 1 día         │
   │ JWT expira              │
   │ Cookie sigue en nave... │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Backend: jwt.verify()    │
   │ Verifica exp claim       │
   │ ❌ Token expirado        │
   └────────┬─────────────────┘
            │
            ▼
   Error 401 "No autorizado"
            │
            ▼
   ┌──────────────────────────────────┐
   │ Frontend: checkLogin() ve error  │
   │ Cookie.remove('token')           │
   │ Usuario debe login nuevamente    │
   └──────────────────────────────────┘
```

---

## 7. Estado de la Aplicación (React)

```
AuthContext State:
┌──────────────────────────────────────────┐
│ {                                        │
│   user: null | {                         │
│     ci: number,                          │
│     nombre: string,                      │
│     apellido: string,                    │
│     email: string,                       │
│     unidad: string,                      │
│     gravatar: string,                    │
│     password_hash: string (no enviar)    │
│   },                                     │
│   isAuth: boolean,                       │
│   errors: null | string[],               │
│   loading: boolean,                      │
│   signin: async (data) => Promise,       │
│   signup: async (data) => Promise,       │
│   signout: async () => void,             │
│ }                                        │
└──────────────────────────────────────────┘

ScoutContext State:
┌──────────────────────────────────────────┐
│ {                                        │
│   scouts: [{                             │
│     ci: number,                          │
│     nombre: string,                      │
│     apellido: string,                    │
│     rama: string,                        │
│     unidad: string,                      │
│     etapa: string,                       │
│     puntaje: number,                     │
│     preguntas_mal_contestadas: number,   │
│     dirigente_ci: number                 │
│   }],                                    │
│   errors: string[],                      │
│   loadscouts: async () => void,          │
│   createScout: async (data) => Promise,  │
│   updateScout: async (ci, data) => ...,  │
│   deleteScout: async (ci) => void,       │
│   loadScout: async (ci) => Promise,      │
│   getScout: (ci) => Scout | undefined,   │
│ }                                        │
└──────────────────────────────────────────┘
```

---

## 8. Puntos de Integración Frontend-Backend

```
FRONTEND                          BACKEND
(React/Axios)                    (Express)
    │                                │
    │──── POST /signin ────────────►  │
    │   { email, password }          │
    │                                │ auth.controller.signin()
    │◄──── 200 + Set-Cookie ─────────│
    │   { user object }              │
    │                                │
    │                                │
    │──── POST /signup ────────────► │
    │   { ci, nombre, ..., pwd }     │
    │                                │ auth.controller.signup()
    │◄──── 200 + Set-Cookie ─────────│
    │   { user object }              │
    │                                │
    │                                │
    │──── GET /profile ────────────► │
    │   Cookie: token=...            │
    │                                │ isAuth() + auth.profile()
    │◄──── 200 ──────────────────────│
    │   { user object }              │
    │                                │
    │                                │
    │──── POST /signout ───────────► │
    │   Cookie: token=...            │
    │                                │ auth.controller.signout()
    │◄──── 200 + Clear-Cookie ───────│
    │                                │
    │                                │
    │──── GET /scouts ────────────► │
    │   Cookie: token=...            │
    │                                │ isAuth() + scout.getScouts()
    │◄──── 200 ──────────────────────│
    │   { scouts: [] }               │
    │                                │
    │                                │
    │──── POST /scout ────────────► │
    │   { ci, nombre, ... }          │
    │   Cookie: token=...            │
    │                                │ isAuth() + validateSchema()
    │                                │ + scout.createScout()
    │◄──── 200 ──────────────────────│
    │   { scout }                    │
    │                                │
    │                                │
    │──── PUT /scout/:ci ─────────► │
    │   { nombre, apellido, ... }    │
    │   Cookie: token=...            │
    │                                │ isAuth() + validateSchema()
    │                                │ + scout.updateScout()
    │◄──── 200 ──────────────────────│
    │   { updated_scout }            │
    │                                │
    │                                │
    │──── DELETE /scout/:ci ──────► │
    │   Cookie: token=...            │
    │                                │ isAuth() + scout.deleteScout()
    │◄──── 200 ──────────────────────│
    │   "Scout deleted"              │
```

---

## 9. Capas de Validación

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. HTML5 Input Validation                                   │
│    - type="email" valida formato                            │
│    - type="number" valida número                            │
│    - required atributo                                      │
│                                                              │
│ 2. React Hook Form                                          │
│    - Validación en tiempo real                              │
│    - Feedback al usuario                                    │
│    - Previene submit si hay errores                         │
│                                                              │
│ 3. Manual Validation                                        │
│    - Lógica personalizada antes de enviar                   │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ axios.post() / axios.get()
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND (Express)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. Middleware: validateSchema                               │
│    - Zod schema validation                                  │
│    - Devuelve 400 si falla                                  │
│    - Impide que llegue al controlador                       │
│                                                              │
│ 2. Middleware: isAuth                                       │
│    - Valida JWT                                             │
│    - Asigna req.userCI                                      │
│    - Devuelve 401 si no autorizado                          │
│                                                              │
│ 3. Controlador                                              │
│    - Lógica de negocio                                      │
│    - Valida restricciones BD                                │
│    - Maneja errores BD (duplicados, FK, etc)               │
│                                                              │
│ 4. Base de Datos                                            │
│    - Constraints SQL                                        │
│    - PRIMARY KEY (no duplicados)                            │
│    - UNIQUE (emails únicos)                                 │
│    - FOREIGN KEY (integridad referencial)                   │
│    - CHECK constraints                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Matriz de Permisos (Por Usuario)

```
┌──────────────────────────────────────────────────────────────┐
│  Dirigente Autenticado (CI=123)                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ✓ GET /profile              → Ver su propio perfil          │
│  ✓ GET /scouts               → Ver SOLO sus scouts           │
│  ✓ GET /scout/:ci            → Ver su scout si le pertenece  │
│  ✓ POST /scout               → Crear scout vinculado a él    │
│  ✓ PUT /scout/:ci            → Actualizar su scout           │
│  ✓ DELETE /scout/:ci         → Eliminar su scout             │
│  ✓ POST /signout             → Cerrar su sesión              │
│                                                               │
│  ✗ GET /scouts (otro)        → ❌ NO VE SCOUTS DE OTROS      │
│  ✗ DELETE /scout/:ci (otro)  → ❌ NO ELIMINA AJENOS          │
│  ✗ PUT /scout/:ci (otro)     → ❌ NO MODIFICA AJENOS         │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Usuario NO Autenticado                                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ✓ POST /signin              → Login                         │
│  ✓ POST /signup              → Registro                      │
│                                                               │
│  ✗ GET /profile              → ❌ 401 Unauthorized           │
│  ✗ GET /scouts               → ❌ 401 Unauthorized           │
│  ✗ POST /scout               → ❌ 401 Unauthorized           │
│  ✗ PUT /scout/:ci            → ❌ 401 Unauthorized           │
│  ✗ DELETE /scout/:ci         → ❌ 401 Unauthorized           │
│                                                               │
└──────────────────────────────────────────────────────────────┘

Implementación:
- isAuth middleware en todas las rutas protegidas
- req.userCI en filtros WHERE para aislar datos
- Error 401 si no hay token o token inválido
```

---

## 11. Checklist: Safe Additions (No romper existente)

```
ANTES DE AGREGAR NUEVAS CARACTERÍSTICAS:

□ Base de Datos
  □ Crear tabla nueva (NO modificar dirigente ni scouts)
  □ O agregar columna NULLABLE a tabla existente
  □ Con DEFAULT value si es posible
  □ Escribir SQL en migrations

□ Backend
  □ Crear nuevo controlador si es nueva entidad
  □ Crear nuevas rutas en router separado
  □ Crear schemas Zod para validación
  □ Usar isAuth en rutas protegidas
  □ Filtrar por req.userCI para aislar datos
  □ NO modificar endpoints existentes
  □ NO cambiar estructura de respuestas existentes

□ Frontend
  □ Crear nuevo contexto si es estado global nuevo
  □ Crear nuevas páginas sin tocar existentes
  □ Actualizar routing en App.jsx
  □ Crear componentes reutilizables
  □ NO modificar contextos existentes (auth, scout)
  □ Usar ProtectedRoute si es privada

□ Testing
  □ Probar con usuario A que no ve datos de usuario B
  □ Probar sin token retorna 401
  □ Probar endpoints antiguos siguen funcionando
  □ Probar validaciones funcionan
  □ Probar error handling consistente
```
