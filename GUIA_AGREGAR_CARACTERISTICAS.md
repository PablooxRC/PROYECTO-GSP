# 🚀 GUÍA PARA AGREGAR NUEVAS CARACTERÍSTICAS SIN ROMPER EL SISTEMA

## Estructura de Carpetas para Nueva Característica

Cuando agregues una nueva funcionalidad, sigue este patrón de carpetas:

```
/src
├── controllers/
│   ├── auth.controller.js      (EXISTENTE - no tocar)
│   ├── scout.controller.js     (EXISTENTE - no tocar)
│   └── [newFeature].controller.js   ← NUEVO
│
├── routes/
│   ├── auth.routes.js          (EXISTENTE)
│   ├── scout.routes.js         (EXISTENTE)
│   └── [newFeature].routes.js  ← NUEVO
│
└── schemas/
    ├── auth.schema.js          (EXISTENTE)
    ├── scout.schema.js         (EXISTENTE)
    └── [newFeature].schema.js  ← NUEVO

/frontend/src
├── context/
│   ├── AuthContext.jsx         (EXISTENTE - no tocar)
│   ├── scoutContex.jsx         (EXISTENTE - no tocar)
│   └── [newFeature]Context.jsx ← NUEVO
│
├── pages/
│   ├── LoginPage.jsx           (EXISTENTE)
│   ├── ScoutsPage.jsx          (EXISTENTE)
│   └── [NewFeaturePage].jsx    ← NUEVO
│
├── api/
│   ├── axios.js                (EXISTENTE)
│   ├── scout.api.js            (EXISTENTE)
│   └── [newFeature].api.js     ← NUEVO
│
└── components/
    ├── ui/                     (EXISTENTE)
    └── [newFeature]/           ← NUEVA CARPETA
        └── [Component].jsx
```

---

## Template: NUEVA TABLA EN BD (PostgreSQL)

### Paso 1: SQL para Crear la Tabla

```sql
-- IMPORTANTE: Usar NULLABLE y DEFAULT donde sea posible
-- para NO afectar registros existentes

CREATE TABLE nueva_entidad (
    id SERIAL PRIMARY KEY,
    campo1 VARCHAR(255) NOT NULL,
    campo2 VARCHAR(255),                    -- NULLABLE
    campo3 NUMERIC DEFAULT 0,               -- DEFAULT
    dirigente_ci INTEGER NOT NULL,          -- FK
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones
    FOREIGN KEY (dirigente_ci) REFERENCES dirigente(ci) ON DELETE CASCADE,
    UNIQUE(campo1, dirigente_ci)            -- Combinación única por usuario
);

-- Índices para performance
CREATE INDEX idx_nueva_entidad_dirigente ON nueva_entidad(dirigente_ci);
CREATE INDEX idx_nueva_entidad_created ON nueva_entidad(created_at);
```

### ⚠️ SI NECESITAS MODIFICAR TABLA EXISTENTE

```sql
-- SIEMPRE AGREGAR COLUMNA CON NULLABLE Y DEFAULT
ALTER TABLE scouts
ADD COLUMN nueva_columna VARCHAR(255) DEFAULT 'valor_defecto';

-- NUNCA hacer esto (rompe registros existentes):
-- ALTER TABLE scouts ADD COLUMN nueva_columna VARCHAR(255) NOT NULL;
```

---

## Template: CONTROLADOR BACKEND

### Archivo: `src/controllers/[feature].controller.js`

```javascript
import { pool } from "../db.js";

// OBTENER LISTADO (pertenece al usuario autenticado)
export const getItems = async (req, res, next) => {
  try {
    // ⚠️ IMPORTANTE: FILTRAR POR req.userCI PARA AISLAR DATOS
    const result = await pool.query(
      "SELECT * FROM nueva_entidad WHERE dirigente_ci = $1 ORDER BY created_at DESC",
      [req.userCI], // ← CRÍTICO: Asegurar que solo ve sus datos
    );
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// OBTENER UNO
export const getItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM nueva_entidad WHERE id = $1 AND dirigente_ci = $2",
      [id, req.userCI], // ← CRÍTICO: Verificar pertenencia
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entidad no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// CREAR
export const createItem = async (req, res, next) => {
  try {
    const { campo1, campo2, campo3 } = req.body;

    const result = await pool.query(
      "INSERT INTO nueva_entidad (campo1, campo2, campo3, dirigente_ci) VALUES ($1, $2, $3, $4) RETURNING *",
      [campo1, campo2, campo3, req.userCI], // ← VINCULAR AL USUARIO
    );

    return res.json(result.rows[0]);
  } catch (error) {
    // Manejo de errores específicos
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Ya existe un registro con esos datos" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ message: "Referencia inválida" });
    }
    next(error);
  }
};

// ACTUALIZAR
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { campo1, campo2, campo3 } = req.body;

    const result = await pool.query(
      "UPDATE nueva_entidad SET campo1 = $1, campo2 = $2, campo3 = $3, updated_at = NOW() WHERE id = $4 AND dirigente_ci = $5 RETURNING *",
      [campo1, campo2, campo3, id, req.userCI], // ← VERIFICAR PERTENENCIA
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entidad no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// ELIMINAR
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM nueva_entidad WHERE id = $1 AND dirigente_ci = $2",
      [id, req.userCI], // ← VERIFICAR PERTENENCIA
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entidad no encontrada" });
    }

    return res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
```

---

## Template: ESQUEMA ZOD (Validación Backend)

### Archivo: `src/schemas/[feature].schema.js`

```javascript
import { z } from "zod";

export const createItemSchema = z.object({
  campo1: z
    .string({
      required_error: "Campo1 es requerido",
      invalid_type_error: "Debe ser texto",
    })
    .min(1)
    .max(255),

  campo2: z.string().optional(),

  campo3: z
    .number({
      invalid_type_error: "Debe ser un número",
    })
    .min(0)
    .optional(),
});

export const updateItemSchema = z.object({
  campo1: z.string().min(1).max(255).optional(),
  campo2: z.string().optional(),
  campo3: z.number().min(0).optional(),
});
```

---

## Template: RUTAS BACKEND

### Archivo: `src/routes/[feature].routes.js`

```javascript
import Router from "express-promise-router";
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/[feature].controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import {
  createItemSchema,
  updateItemSchema,
} from "../schemas/[feature].schema.js";

const router = Router();

// IMPORTANTE: Todas las rutas usan isAuth para proteger datos

router.get("/items", isAuth, getItems);

router.get("/item/:id", isAuth, getItem);

router.post("/item", isAuth, validateSchema(createItemSchema), createItem);

router.put("/item/:id", isAuth, validateSchema(updateItemSchema), updateItem);

router.delete("/item/:id", isAuth, deleteItem);

export default router;
```

### Actualizar `src/app.js` para registrar nuevas rutas:

```javascript
import featureRoutes from "./routes/[feature].routes.js";

// ... otros imports

app.use("/api", featureRoutes); // ← AGREGAR ESTA LÍNEA
app.use("/api", taskRoutes); // (Existente)
app.use("/api", authRoutes); // (Existente)
```

---

## Template: API CLIENT FRONTEND

### Archivo: `frontend/src/api/[feature].api.js`

```javascript
import axios from "./axios";

// Obtener listado
export const getItemsRequest = () => axios.get("/items");

// Obtener uno
export const getItemRequest = (id) => axios.get(`/item/${id}`);

// Crear
export const createItemRequest = (item) => axios.post("/item", item);

// Actualizar
export const updateItemRequest = (id, item) => axios.put(`/item/${id}`, item);

// Eliminar
export const deleteItemRequest = (id) => axios.delete(`/item/${id}`);
```

---

## Template: CONTEXTO FRONTEND

### Archivo: `frontend/src/context/[Feature]Context.jsx`

```javascript
import { createContext, useState, useContext } from "react";
import {
  getItemsRequest,
  getItemRequest,
  createItemRequest,
  updateItemRequest,
  deleteItemRequest,
} from "../api/[feature].api";

const FeatureContext = createContext();

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeature debe usarse dentro de FeatureProvider");
  }
  return context;
};

export const FeatureProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener listado
  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await getItemsRequest();
      setItems(res.data);
      setErrors([]);
    } catch (error) {
      const message = error.response?.data?.message || "Error cargando datos";
      setErrors([message]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener uno
  const loadItem = async (id) => {
    try {
      const res = await getItemRequest(id);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Error cargando dato";
      setErrors([message]);
      return null;
    }
  };

  // Crear
  const createItem = async (itemData) => {
    try {
      const res = await createItemRequest(itemData);
      setItems([...items, res.data]);
      setErrors([]);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Error creando";
      setErrors([message]);
      return null;
    }
  };

  // Actualizar
  const updateItem = async (id, itemData) => {
    try {
      const res = await updateItemRequest(id, itemData);
      setItems(items.map((item) => (item.id === id ? res.data : item)));
      setErrors([]);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Error actualizando";
      setErrors([message]);
      return null;
    }
  };

  // Eliminar
  const deleteItem = async (id) => {
    try {
      await deleteItemRequest(id);
      setItems(items.filter((item) => item.id !== id));
      setErrors([]);
    } catch (error) {
      const message = error.response?.data?.message || "Error eliminando";
      setErrors([message]);
    }
  };

  return (
    <FeatureContext.Provider
      value={{
        items,
        errors,
        loading,
        loadItems,
        loadItem,
        createItem,
        updateItem,
        deleteItem,
        setErrors,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};
```

---

## Template: PÁGINA FRONTEND

### Archivo: `frontend/src/pages/[Feature]Page.jsx`

```javascript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeature } from "../context/[Feature]Context";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

function FeaturePage() {
  const { user } = useAuth();
  const { items, loadItems, deleteItem, loading, errors } = useFeature();
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="relative">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold dark:text-white">Mis Items</h1>
        <p className="text-gray-600">Usuario: {user?.nombre}</p>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      {/* Botón crear */}
      <Button
        className="mb-4 bg-blue-600 hover:bg-blue-700"
        onClick={() => navigate("/items/create")}
      >
        Crear Item
      </Button>

      {/* Listado */}
      <div className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <h3 className="text-xl font-bold">{item.campo1}</h3>
            <p className="text-gray-600">{item.campo2}</p>
            <p className="font-semibold">Valor: {item.campo3}</p>

            <div className="mt-4 flex gap-2">
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => navigate(`/items/${item.id}/edit`)}
              >
                Editar
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (window.confirm("¿Eliminar?")) {
                    deleteItem(item.id);
                  }
                }}
              >
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FeaturePage;
```

---

## Template: ACTUALIZAR App.jsx CON NUEVAS RUTAS

### En `frontend/src/App.jsx`:

```javascript
import { ProtectedRoute } from "./components/ProtecttedRoute";
import FeaturePage from "./pages/FeaturePage";
import FeatureFormPage from "./pages/FeatureFormPage";

// ... dentro de BrowserRouter

<Routes>
  {/* Rutas existentes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Nuevas rutas - PROTEGIDAS */}
  <Route element={<ProtectedRoute />}>
    <Route path="/items" element={<FeaturePage />} />
    <Route path="/items/create" element={<FeatureFormPage />} />
    <Route path="/items/:id/edit" element={<FeatureFormPage />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>;
```

---

## Template: ACTUALIZAR main.jsx CON NUEVO PROVIDER

### En `frontend/src/main.jsx`:

```javascript
import { AuthProvider } from "./context/AuthContext";
import { ScoutProvides } from "./context/scoutContex";
import { FeatureProvider } from "./context/[Feature]Context"; // ← NUEVO

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ScoutProvides>
        <FeatureProvider>
          {" "}
          {/* ← NUEVO */}
          <App />
        </FeatureProvider>
      </ScoutProvides>
    </AuthProvider>
  </React.StrictMode>,
);
```

---

## ✅ CHECKLIST: Antes de ir a Producción

```
Backend:
☐ Nueva tabla creada sin tocar existentes
☐ Controlador con isAuth en todas las rutas
☐ Filtros WHERE por req.userCI en listados/actualizaciones/eliminaciones
☐ Esquemas Zod con validaciones completas
☐ Rutas registradas en app.js
☐ Manejo de errores (400, 404, 409, 500)
☐ ForeignKey a dirigente_ci

Frontend:
☐ Contexto creado con manejo de errores
☐ API client creado
☐ Página creada
☐ Rutas agregadas a App.jsx
☐ ProtectedRoute en rutas privadas
☐ Errores mostrados al usuario
☐ Loading states implementados

Testing:
☐ Usuario A no ve datos de Usuario B
☐ Sin token retorna 401
☐ Validaciones funcionan
☐ Endpoints antiguos siguen operando
☐ Respuestas consistentes con formato existente
☐ Confirmaciones antes de eliminar
```

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ NO HACER ESTO

```javascript
// ❌ MAL: No filtrar por usuario
export const getItems = async (req, res) => {
    const result = await pool.query('SELECT * FROM items');
    return res.json(result.rows);  // ← ¡VE TODOS LOS ITEMS!
};

// ❌ MAL: Modificar tablas existentes sin nullable
ALTER TABLE scouts ADD COLUMN nueva_columna VARCHAR(255) NOT NULL;

// ❌ MAL: Ignorar isAuth
router.get('/items', getItems);  // ← SIN isAuth, ¡sin protección!

// ❌ MAL: Cambiar estructura de respuesta existente
// Si antes retornaba { user: {...} }, no cambiar a { usuario: {...} }

// ❌ MAL: Hardcodear IDs
export const getItem = async (req, res) => {
    const result = await pool.query('SELECT * FROM items WHERE id = 1');  // ← ¡MAL!
};

// ❌ MAL: No validar con Zod
router.post('/item', createItem);  // ← SIN validateSchema
```

### ✅ HACER ESTO

```javascript
// ✅ BIEN: Filtrar siempre por usuario
export const getItems = async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM items WHERE user_id = $1',
        [req.userCI]  // ← FILTRADO
    );
    return res.json(result.rows);
};

// ✅ BIEN: Columnas nullable con default
ALTER TABLE scouts
ADD COLUMN nueva_columna VARCHAR(255) DEFAULT 'default' NULL;

// ✅ BIEN: Proteger con isAuth
router.get('/items', isAuth, getItems);

// ✅ BIEN: Mantener consistencia
// Si AuthContext retorna { user }, seguir usando { user }

// ✅ BIEN: Usar parámetros
export const getItem = async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
        'SELECT * FROM items WHERE id = $1 AND user_id = $2',
        [id, req.userCI]  // ← PARÁMETROS
    );
};

// ✅ BIEN: Validar con Zod
router.post('/item', isAuth, validateSchema(itemSchema), createItem);
```

---

## 📋 Ejemplo Completo: Agregar "Actividades"

Este es un ejemplo completo paso a paso:

### PASO 1: BD

```sql
CREATE TABLE actividades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    dirigente_ci INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dirigente_ci) REFERENCES dirigente(ci) ON DELETE CASCADE
);
```

### PASO 2: Controlador (`src/controllers/actividad.controller.js`)

```javascript
import { pool } from "../db.js";

export const getActividades = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM actividades WHERE dirigente_ci = $1 ORDER BY fecha DESC",
      [req.userCI],
    );
    return res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const createActividad = async (req, res, next) => {
  try {
    const { nombre, descripcion, fecha } = req.body;
    const result = await pool.query(
      "INSERT INTO actividades (nombre, descripcion, fecha, dirigente_ci) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, descripcion, fecha, req.userCI],
    );
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateActividad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha, estado } = req.body;
    const result = await pool.query(
      "UPDATE actividades SET nombre = $1, descripcion = $2, fecha = $3, estado = $4 WHERE id = $5 AND dirigente_ci = $6 RETURNING *",
      [nombre, descripcion, fecha, estado, id, req.userCI],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteActividad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM actividades WHERE id = $1 AND dirigente_ci = $2",
      [id, req.userCI],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    return res.json({ message: "Actividad eliminada" });
  } catch (error) {
    next(error);
  }
};
```

### PASO 3: Schema (`src/schemas/actividad.schema.js`)

```javascript
import { z } from "zod";

export const createActividadSchema = z.object({
  nombre: z.string().min(1).max(255),
  descripcion: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
});

export const updateActividadSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  descripcion: z.string().optional(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  estado: z.enum(["pendiente", "en_progreso", "completada"]).optional(),
});
```

### PASO 4: Rutas (`src/routes/actividad.routes.js`)

```javascript
import Router from "express-promise-router";
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
} from "../controllers/actividad.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import {
  createActividadSchema,
  updateActividadSchema,
} from "../schemas/actividad.schema.js";

const router = Router();

router.get("/actividades", isAuth, getActividades);
router.post(
  "/actividad",
  isAuth,
  validateSchema(createActividadSchema),
  createActividad,
);
router.put(
  "/actividad/:id",
  isAuth,
  validateSchema(updateActividadSchema),
  updateActividad,
);
router.delete("/actividad/:id", isAuth, deleteActividad);

export default router;
```

### PASO 5: Registrar en app.js

```javascript
import actividadRoutes from "./routes/actividad.routes.js";
app.use("/api", actividadRoutes);
```

### PASO 6: API Client (`frontend/src/api/actividad.api.js`)

```javascript
import axios from "./axios";

export const getActividadesRequest = () => axios.get("/actividades");
export const createActividadRequest = (actividad) =>
  axios.post("/actividad", actividad);
export const updateActividadRequest = (id, actividad) =>
  axios.put(`/actividad/${id}`, actividad);
export const deleteActividadRequest = (id) => axios.delete(`/actividad/${id}`);
```

### PASO 7: Contexto (`frontend/src/context/ActividadContext.jsx`)

```javascript
import { createContext, useState, useContext } from "react";
import {
  getActividadesRequest,
  createActividadRequest,
  updateActividadRequest,
  deleteActividadRequest,
} from "../api/actividad.api";

const ActividadContext = createContext();

export const useActividad = () => {
  const context = useContext(ActividadContext);
  if (!context) throw new Error("Usar dentro de ActividadProvider");
  return context;
};

export const ActividadProvider = ({ children }) => {
  const [actividades, setActividades] = useState([]);
  const [errors, setErrors] = useState([]);

  const loadActividades = async () => {
    try {
      const res = await getActividadesRequest();
      setActividades(res.data);
    } catch (error) {
      setErrors([error.response?.data?.message || "Error"]);
    }
  };

  const createActividad = async (data) => {
    try {
      const res = await createActividadRequest(data);
      setActividades([...actividades, res.data]);
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.message || "Error"]);
      return null;
    }
  };

  const updateActividad = async (id, data) => {
    try {
      const res = await updateActividadRequest(id, data);
      setActividades(actividades.map((a) => (a.id === id ? res.data : a)));
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.message || "Error"]);
      return null;
    }
  };

  const deleteActividad = async (id) => {
    try {
      await deleteActividadRequest(id);
      setActividades(actividades.filter((a) => a.id !== id));
    } catch (error) {
      setErrors([error.response?.data?.message || "Error"]);
    }
  };

  return (
    <ActividadContext.Provider
      value={{
        actividades,
        errors,
        loadActividades,
        createActividad,
        updateActividad,
        deleteActividad,
      }}
    >
      {children}
    </ActividadContext.Provider>
  );
};
```

### PASO 8: Página (`frontend/src/pages/ActividadesPage.jsx`)

```javascript
import { useEffect } from "react";
import { useActividad } from "../context/ActividadContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

function ActividadesPage() {
  const { actividades, loadActividades, deleteActividad, errors } =
    useActividad();

  useEffect(() => {
    loadActividades();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Actividades</h1>

      {errors.length > 0 && (
        <div className="bg-red-100 p-4 mb-4">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      <Button className="mb-4 bg-green-600">Nueva Actividad</Button>

      <div className="grid grid-cols-2 gap-4">
        {actividades.map((act) => (
          <Card key={act.id} className="p-4">
            <h3 className="font-bold text-lg">{act.nombre}</h3>
            <p>{act.descripcion}</p>
            <p className="text-sm text-gray-600">Fecha: {act.fecha}</p>
            <p className="text-xs">Estado: {act.estado}</p>
            <Button
              className="mt-2 bg-red-500"
              onClick={() => {
                if (confirm("¿Eliminar?")) deleteActividad(act.id);
              }}
            >
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ActividadesPage;
```

### PASO 9: Actualizar App.jsx

```javascript
import ActividadesPage from './pages/ActividadesPage';
import { ActividadProvider } from './context/ActividadContext';

// En main.jsx
<ActividadProvider>
    <App />
</ActividadProvider>

// En App.jsx rutas
<Route element={<ProtectedRoute />}>
    <Route path="/actividades" element={<ActividadesPage />} />
</Route>
```

### PASO 10: Testear

```
✓ Login como usuario A
✓ Crear actividad → debe vincularse a usuario A
✓ Ver listado → solo ve sus actividades
✓ Logout y login como usuario B
✓ Ver listado → usuario B NO ve actividades de usuario A
✓ Borrar actividad → funciona sin errores
✓ Verificar que scouts y otras funcionalidades siguen operando
```

---

¡Y listo! Has agregado una nueva característica sin romper nada existente.
