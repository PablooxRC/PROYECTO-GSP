# 🚨 PROBLEMAS COMUNES Y CÓMO EVITARLOS

Esta es una guía para evitar los errores más comunes que rompen el sistema o generan vulnerabilidades de seguridad.

---

## 🔴 PROBLEMA 1: Usuario A Ve Datos de Usuario B

### ¿Qué pasa?

El usuario A logueado ve la lista completa de scouts, incluyendo scouts de otros dirigentes.

### ¿Dónde está el bug?

**Backend - en el controlador**:

```javascript
// ❌ MALO - Sin filtro
export const getScouts = async (req, res) => {
  const result = await pool.query("SELECT * FROM scouts");
  return res.json(result.rows);
};
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Filtra por usuario
export const getScouts = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM scouts WHERE dirigente_ci = $1",
    [req.userCI], // ← CRÍTICO
  );
  return res.json(result.rows);
};
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Toda query de SELECT incluye WHERE dirigente_ci = $1
☐ Toda query de UPDATE incluye WHERE ... AND dirigente_ci = $1
☐ Toda query de DELETE incluye WHERE ... AND dirigente_ci = $1
☐ El parámetro es req.userCI, no un valor hardcodeado
☐ En getScouts() ya está implementado correctamente
```

---

## 🔴 PROBLEMA 2: Ruta Sin Autenticación

### ¿Qué pasa?

Una ruta que debería ser privada (requiere login) no tiene protección, cualquiera puede acceder.

### ¿Dónde está el bug?

**Backend - en routes**:

```javascript
// ❌ MALO - Sin isAuth
router.get("/scouts", getScouts); // ← Sin middleware!
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Con isAuth
router.get("/scouts", isAuth, getScouts); // ← Con middleware
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ TODAS las rutas que acceden datos del usuario tienen isAuth
☐ TODAS las rutas que modifican datos tienen isAuth
☐ SOLO signup e signin NO tienen isAuth (son públicas)
☐ /profile, /scouts, /scout/* todas tienen isAuth
☐ Después de agregar ruta nueva, verificar isAuth
```

---

## 🔴 PROBLEMA 3: Token Expirado

### ¿Qué pasa?

Usuario está logueado, pasa 1 día, intenta usar la app y obtiene 401 "Unauthorized".

### ¿Dónde está el bug?

Es _diseño_, no un bug. Los tokens expiran cada 24 horas por seguridad.

### ¿Cómo lo arreglas?

Frontend debe manejar esto elegantemente:

```javascript
// En AuthContext checkLogin() - ACTUAL
const checkLogin = async () => {
  if (token) {
    try {
      const res = await axios.get("/profile");
      setUser(res.data);
      setIsAuth(true);
    } catch (err) {
      // ✅ Limpia token y redirige a login
      setUser(null);
      setIsAuth(false);
      Cookie.remove("token");
    }
  }
};
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Frontend captura errores 401 en checkLogin()
☐ Frontend elimina cookie de token en error
☐ Frontend redirige a login
☐ Usuario debe hacer login nuevamente (normal)
☐ Token tiene expiración corta (1 día) por seguridad
```

---

## 🔴 PROBLEMA 4: Modificar Tabla Existente Incorrectamente

### ¿Qué pasa?

Agregas una columna NOT NULL sin DEFAULT, y todos los registros existentes quedan inconsistentes.

### ¿Dónde está el bug?

**En base de datos**:

```sql
-- ❌ MALO - Rompe registros existentes
ALTER TABLE scouts ADD COLUMN nueva_columna VARCHAR(255) NOT NULL;

-- Error: null value in column "nueva_columna" violates not-null constraint
```

### ¿Cómo lo arreglas?

```sql
-- ✅ CORRECTO - Con DEFAULT para registros existentes
ALTER TABLE scouts ADD COLUMN nueva_columna VARCHAR(255) DEFAULT 'default_value';

-- O si puede ser null:
ALTER TABLE scouts ADD COLUMN nueva_columna VARCHAR(255);
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Nuevas columnas siempre NULLABLE o con DEFAULT
☐ Nunca agregar NOT NULL sin DEFAULT en tabla existente
☐ Hacer migration en script SQL
☐ Testear en desarrollo antes de producción
☐ En scouts: ya tiene puntaje y preguntas_mal_contestadas
```

---

## 🔴 PROBLEMA 5: Validación Solo en Frontend

### ¿Qué pasa?

Solo validas en React Hook Form, no en el backend. Un usuario malicioso bypasea el frontend y envía datos inválidos directamente.

### ¿Dónde está el bug?

**Frontend sin backend**:

```javascript
// ❌ MALO - Solo frontend valida
<Input required type="email" /> // ← HTML validation

// Backend sin validación:
// export const createScout = async (req, res) => {
//     const { ci, nombre, ... } = req.body;  // ← Ni siquiera valida!
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Backend siempre valida

// routes/scout.routes.js
router.post('/scout', isAuth, validateSchema(createScoutSchema), createScout);

// schemas/scout.schema.js
export const createScoutSchema = z.object({
    ci: z.number().int().positive(),
    nombre: z.string().min(1).max(255),
    ...
});
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ TODAS las rutas POST/PUT/DELETE tienen validateSchema
☐ validateSchema usa Zod schemas
☐ Schemas están en src/schemas/
☐ No confiar en validación solo frontend
☐ Backend debe rechazar datos inválidos con 400
```

---

## 🔴 PROBLEMA 6: No Verificar Pertenencia en UPDATE/DELETE

### ¿Qué pasa?

Usuario A intenta editar/eliminar scout de Usuario B... y funciona!

### ¿Dónde está el bug?

**Backend - en UPDATE/DELETE sin verificación**:

```javascript
// ❌ MALO - Sin verificar pertenencia
export const updateScout = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE scouts SET nombre = $1 WHERE id = $2",
    [nombre, id], // ← No verifica dirigente_ci!
  );
  return res.json(result.rows[0]);
};
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Verifica pertenencia
export const updateScout = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE scouts SET nombre = $1 WHERE id = $2 AND dirigente_ci = $3",
    [nombre, id, req.userCI], // ← VERIFICA!
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Scout no encontrado" });
  }
  return res.json(result.rows[0]);
};
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ UPDATE siempre tiene WHERE AND dirigente_ci = $X
☐ DELETE siempre tiene WHERE AND dirigente_ci = $X
☐ Si rowCount === 0, retorna 404
☐ Nunca confiar en que el cliente envía el usuario correcto
☐ En updateScout() ya está implementado correctamente
```

---

## 🔴 PROBLEMA 7: No Proteger Rutas Frontend

### ¿Qué pasa?

Usuario no autenticado accede a URL directa /scouts y ve la página (aunque sin datos).

### ¿Dónde está el bug?

**Frontend - routes sin ProtectedRoute**:

```javascript
// ❌ MALO - Ruta pública
<Route path="/scouts" element={<ScoutsPage />} />
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Ruta protegida
<Route element={<ProtectedRoute />}>
  <Route path="/scouts" element={<ScoutsPage />} />
</Route>
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ ScoutsPage está dentro de ProtectedRoute
☐ ProfilePage está dentro de ProtectedRoute
☐ ScoutFormPage está dentro de ProtectedRoute
☐ LoginPage y RegisterPage NO están protegidas (son públicas)
☐ ProtectedRoute redirige a /login si no autenticado
```

---

## 🔴 PROBLEMA 8: Hardcodear Secretos

### ¿Qué pasa?

El JWT secret está en el código: `jwt.sign(payload, 'xyz123', ...)`. Si alguien ve el código, puede falsificar tokens.

### ¿Dónde está el bug?

**Backend - jwt.js**:

```javascript
// ❌ MALO - Secret hardcodeado
export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      "xyz123",
      {
        // ← EXPUESTO!
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      },
    );
  });
};
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Secret desde variable de entorno
export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        // ← DESDE ENV
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      },
    );
  });
};
```

Crear `.env`:

```
JWT_SECRET=tu-secreto-muy-largo-y-seguro-aqui
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Crear archivo .env en raíz backend
☐ Agregar .env a .gitignore
☐ Usar process.env.JWT_SECRET
☐ Usar process.env.DB_PASSWORD
☐ NUNCA commitear .env a git
☐ En producción, establecer variables en servidor
```

---

## 🔴 PROBLEMA 9: Error No Específico

### ¿Qué pasa?

Usuario obtiene error genérico "Something went wrong" sin saber qué falló.

### ¿Dónde está el bug?

**Frontend sin manejo de errores específicos**:

```javascript
// ❌ MALO - Error genérico
try {
  const res = await createScout(data);
} catch (error) {
  setErrors(["Error"]); // ← ¿Qué error?
}
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Error específico
try {
  const res = await createScout(data);
  setErrors([]);
} catch (error) {
  const message = error.response?.data?.message || "Error desconocido";
  setErrors([message]); // ← Mensaje específico
}
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Backend retorna message descriptivo
☐ Frontend captura error.response.data.message
☐ Frontend tiene fallback "Error desconocido"
☐ Errores se muestran al usuario
☐ No loguear información sensible en errores
```

---

## 🔴 PROBLEMA 10: No Testear con Múltiples Usuarios

### ¿Qué pasa?

El sistema funciona bien con tu usuario de prueba, pero cuando agregan otros usuarios, hay conflictos o aislamiento incorrecto.

### ¿Dónde está el bug?

No hay bug hasta que testeas con múltiples usuarios.

### ¿Cómo lo arreglas?

```
PROCEDIMIENTO DE TESTING:

1. Crear 2+ usuarios en BD
   - Usuario A: CI 111, email a@example.com
   - Usuario B: CI 222, email b@example.com

2. Login como Usuario A
   - Crear scout S1
   - Verificar que S1 aparece
   - Logout

3. Login como Usuario B
   - Ver scouts → S1 NO debe aparecer
   - Crear scout S2
   - Verificar que solo S2 aparece
   - Logout

4. Login como Usuario A nuevamente
   - Ver scouts → Solo S1 debe aparecer
   - S2 NO debe aparecer

5. Intentar acceso directo
   - Usuario B intenta GET /api/scout/S1
   - Debe retornar 404 "Not found"
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Testear SIEMPRE con 2+ usuarios
☐ Cada usuario en incógnito/navegador diferente
☐ Verificar que nunca ve datos de otro
☐ Intentar eliminar scout de otro usuario → debe fallar
☐ Intentar editar scout de otro usuario → debe fallar
☐ En desarrollo, agregar usuarios de test
```

---

## 🔴 PROBLEMA 11: Modificar Controlador Existente

### ¿Qué pasa?

Cambias el controlador `getScouts()` para agregar filtros, pero rompes el frontend que ya lo usa.

### ¿Dónde está el bug?

Modificar endpoint existente sin avisar.

### ¿Cómo lo arreglas?

**NUNCA modifiques endpoints existentes**. En su lugar:

```
1. Crea endpoint NUEVO si necesita diferentes parámetros
2. Mantén el viejo para backward compatibility
3. Si DEBES cambiar, cambia en frontend también
4. SIEMPRE testea que frontend siga funcionando
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ No modificar rutas existentes sin necesidad
☐ Si cambias un endpoint, cambiar también frontend
☐ Testear que funciona después del cambio
☐ Documento: si cambio un endpoint, actualizar ANALISIS_DEL_SISTEMA.md
☐ Preferiblemente, agregar endpoint nuevo en lugar de modificar
```

---

## 🔴 PROBLEMA 12: Contexto No Inicializado

### ¿Qué pasa?

Componente usa `useScout()` pero ScoutProvider no está en el árbol de componentes. Error: "useScout must be used within ScoutProvider".

### ¿Dónde está el bug?

**Frontend - main.jsx sin ScoutProvider**:

```javascript
// ❌ MALO - Sin providers
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App /> // ← No tiene contextos!
  </React.StrictMode>,
);
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Con providers
import { AuthProvider } from "./context/AuthContext";
import { ScoutProvides } from "./context/scoutContex";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ScoutProvides>
        {" "}
        // ← Contexto agregado
        <App />
      </ScoutProvides>
    </AuthProvider>
  </React.StrictMode>,
);
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Crear nuevo contexto en src/context/
☐ Crear nuevo Provider (con nombre terminado en Provider)
☐ Envolver en main.jsx en el orden correcto
☐ AuthProvider siempre al exterior (necesario primero)
☐ ScoutProvider dentro de AuthProvider
☐ Componentes usan useAuth(), useScout()
```

---

## 🔴 PROBLEMA 13: Cookie Sin httpOnly

### ¿Qué pasa?

El token JWT se guarda en cookie pero sin httpOnly, haciendo vulnerable a XSS (si alguien inyecta código malicioso, puede robar el token).

### ¿Dónde está el bug?

**Backend - auth.controller.js**:

```javascript
// ❌ POCO SEGURO - Sin httpOnly
res.cookie("token", token, {
  // httpOnly: true,  // ← COMENTADO!
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
});
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Con httpOnly
res.cookie("token", token, {
  httpOnly: true, // ← SIN COMENTARIOS
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
});
```

Nota: Esto está ya implementado en el código actual, pero comentado.

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Cookies siempre con httpOnly: true (excepto solo test local)
☐ Cookies siempre con secure: true (solo HTTPS)
☐ Cookies siempre con sameSite: "strict" o "lax"
☐ Nunca guardar token en localStorage (vulnerable a XSS)
☐ Preferir cookies httpOnly (no accesibles desde JS)
```

---

## 🔴 PROBLEMA 14: Schema Zod Incompleto

### ¿Qué pasa?

Schema valida algunos campos pero no todos. Se crea Scout sin apellido porque no lo validaste.

### ¿Dónde está el bug?

**schemas/scout.schema.js**:

```javascript
// ❌ MALO - Schema incompleto
export const createScoutSchema = z.object({
  ci: z.number().positive(),
  nombre: z.string().min(1),
  // ← Falta apellido, rama, unidad, etapa!
});
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Schema completo
export const createScoutSchema = z.object({
  ci: z.number().int().positive(),
  nombre: z.string().min(1).max(255),
  apellido: z.string().min(1).max(255),
  rama: z.string().min(1).max(255),
  unidad: z.string().min(1).max(255),
  etapa: z.string().min(1).max(255),
});
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Schema Zod incluye TODOS los campos del body
☐ Cada campo tiene restricciones (min, max, type)
☐ Campos opcionales tienen .optional()
☐ Email tiene validación .email()
☐ Números tienen .positive(), .int() si aplica
☐ Documentar en schema si campo es requerido
☐ Testear request sin algunos campos → debe rechazar
```

---

## 🔴 PROBLEMA 15: No Handlear rowCount = 0

### ¿Qué pasa?

Usuario intenta editar scout que no existe o no le pertenece, y el sistema retorna 200 OK sin cambiar nada.

### ¿Dónde está el bug?

**Backend - controller sin verificar rowCount**:

```javascript
// ❌ MALO - No verifica si actualización funcionó
export const updateScout = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE scouts SET nombre = $1 WHERE id = $2 AND dirigente_ci = $3",
    [nombre, id, req.userCI],
  );
  return res.json(result.rows[0]); // ← ¿Existía el scout?
};
```

### ¿Cómo lo arreglas?

```javascript
// ✅ CORRECTO - Verifica rowCount
export const updateScout = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE scouts SET nombre = $1 WHERE id = $2 AND dirigente_ci = $3 RETURNING *",
    [nombre, id, req.userCI],
  );
  if (result.rowCount === 0) {
    // ← VERIFICA!
    return res.status(404).json({ message: "Scout no encontrado" });
  }
  return res.json(result.rows[0]);
};
```

### ¿Cómo lo previene?

```
CHECKLIST:
☐ Después de UPDATE/DELETE, verificar result.rowCount
☐ Si rowCount === 0, retorna 404 "Not found"
☐ Si rowCount > 1, log warning (no debería pasar)
☐ En DELETE, retornar mensaje o simplemente 200
☐ En SELECT con findOne, verificar result.rowCount === 1
```

---

## 📋 Resumen: Top 5 Errores Críticos

| #   | Error                                     | Impacto                              | Solución                          |
| --- | ----------------------------------------- | ------------------------------------ | --------------------------------- |
| 1   | Sin filtro `WHERE dirigente_ci`           | 🔴 CRÍTICO: Usuario A ve datos de B  | Agregar `WHERE dirigente_ci = $1` |
| 2   | Ruta sin `isAuth`                         | 🔴 CRÍTICO: Acceso sin autenticación | Agregar `isAuth` en ruta          |
| 3   | No verificar pertenencia en UPDATE/DELETE | 🔴 CRÍTICO: Modificar datos ajenos   | Agregar `AND dirigente_ci = $X`   |
| 4   | Token no protegido                        | 🔴 CRÍTICO: Token puede ser robado   | Usar `httpOnly: true`             |
| 5   | Sin validación backend                    | 🟠 ALTO: Datos inválidos aceptados   | Usar `validateSchema()`           |

---

## ✅ Checklist Final

Antes de cada commit:

```
☐ Nuevas rutas POST/PUT/DELETE tienen validateSchema
☐ Nuevas rutas con datos tienen isAuth
☐ SELECT/UPDATE/DELETE filtran por dirigente_ci
☐ UPDATE/DELETE verifican rowCount antes de responder
☐ No hay hardcoded secrets en código
☐ Testee con 2+ usuarios
☐ Usuario A no ve datos de Usuario B
☐ Cookies tienen httpOnly (no comentado)
☐ Errores son específicos, no genéricos
☐ Documentación fue actualizada
```

---

**Última actualización**: 9 de febrero de 2026  
**¡Mantén el sistema seguro! 🔒**
