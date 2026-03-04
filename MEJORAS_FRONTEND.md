/\*\*

- MEJORAS PARA FRONTEND
  \*/

# 🎨 MEJORAS PROPUESTAS PARA FRONTEND

## 1. VALIDACIÓN DE FORMULARIOS

### Problema ❌

- No hay validación en cliente antes de enviar
- Errores del servidor no se muestran amigablemente
- Inputs sin feedback de error

### Solución ✅

#### A) Crear hook de validación:

```javascript
// src/hooks/useFormValidation.js
import { useState } from "react";
import { validators } from "../utils/validators";

export function useFormValidation(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    // Usar validadores según el campo
    switch (name) {
      case "email":
        return validators.isValidEmail(value) ? "" : "Email inválido";
      case "password":
        return validators.isStrongPassword(value)
          ? ""
          : "Contraseña débil (mín 8: mayús, minús, número)";
      case "ci":
        return validators.isValidCI(value)
          ? ""
          : "CI debe ser un número válido";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos
    const newErrors = {};
    Object.keys(values).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error?.message || "Error desconocido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
  };
}
```

#### B) Usar en componentes:

```javascript
// src/pages/LoginPage.jsx
import { useFormValidation } from "../hooks/useFormValidation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signin } = useAuth();
  const form = useFormValidation(
    { email: "", password: "" },
    async (values) => {
      await signin(values);
    },
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="Email"
          className={form.errors.email ? "border-red-500" : ""}
        />
        {form.touched.email && form.errors.email && (
          <p className="text-red-500 text-sm">{form.errors.email}</p>
        )}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="Contraseña"
          className={form.errors.password ? "border-red-500" : ""}
        />
        {form.touched.password && form.errors.password && (
          <p className="text-red-500 text-sm">{form.errors.password}</p>
        )}
      </div>

      {form.errors.submit && (
        <p className="text-red-500">{form.errors.submit}</p>
      )}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
```

---

## 2. MANEJO DE ERRORES MEJORADO

### Crear componente ErrorBoundary:

```javascript
// src/components/ErrorBoundary.jsx
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="font-bold text-red-800">Error en la aplicación</h2>
          <p className="text-red-700">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 3. UTILIDADES DE CLIENTE

### Crear src/utils/validators.js:

```javascript
// Frontend validators (espejo del backend)
export const validators = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  isStrongPassword: (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password),

  isValidCI: (ci) => Number.isInteger(parseInt(ci)) && parseInt(ci) > 0,

  isValidPhone: (phone) =>
    /^(\+\d{1,3}[- ]?)?\d{2,}$/.test(phone.replace(/\s/g, "")),

  hasValidLength: (str, min = 1, max = 255) => {
    const length = str?.trim?.().length || 0;
    return length >= min && length <= max;
  },
};
```

### Crear src/utils/errorMessages.js:

```javascript
// Traducciones de errores del servidor
export const getErrorMessage = (errorCode) => {
  const messages = {
    VALIDATION_ERROR: "Por favor verifica tu entrada",
    AUTHENTICATION_ERROR: "Debes iniciar sesión",
    AUTHORIZATION_ERROR: "No tienes permiso para hacer esto",
    NOT_FOUND: "El recurso no fue encontrado",
    CONFLICT: "Este registro ya existe",
    DATABASE_ERROR: "Error en la base de datos",
    RATE_LIMIT_EXCEEDED: "Demasiadas solicitudes, intenta más tarde",
  };
  return messages[errorCode] || "Error desconocido";
};
```

---

## 4. HOOK MEJORADO PARA API

### src/hooks/useApi.js:

```javascript
import { useState, useCallback } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api(config);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "Error desconocido");
      }

      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error, setError };
}
```

---

## 5. LOADER Y SPINNER

### src/components/ui/Loader.jsx:

```javascript
export function Loader({ message = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
}
```

---

## 6. MEJORAS AL CONTEXTO

### src/context/AuthContext.jsx mejorado:

```javascript
import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getProfile,
  signin as signinApi,
  signup as signupApi,
} from "../api/auth.api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si está autenticado al cargar
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
        setIsAuth(true);
      } catch (err) {
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const signin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await signinApi({ email, password });
      setUser(userData);
      setIsAuth(true);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await signupApi(data);
      setUser(userData);
      setIsAuth(true);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Llamar endpoint de logout
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        loading,
        error,
        signin,
        signup,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 7. COMPONENTE DE NOTIFICACIÓN

### src/components/ui/Toast.jsx:

```javascript
import { useState, useEffect } from "react";

export function Toast({ message, type = "info", duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }[type];

  return <div className={`p-4 border rounded mb-4 ${bgColor}`}>{message}</div>;
}
```

---

## 8. STRUCTURE DE PRINCIPALES CARPETAS

```
frontend/src/
├── components/
│   ├── ui/              ← Componentes reutilizables
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Toast.jsx
│   │   └── ErrorBoundary.jsx
│   ├── forms/           ← Formularios complejos
│   │   ├── ScoutForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegistroForm.jsx
│   └── layout/          ← Layout
│       ├── Navbar.jsx
│       └── Footer.jsx
├── hooks/               ← Hooks personalizado
│   ├── useFormValidation.js
│   ├── useApi.js
│   └── usePagination.js
├── utils/               ← Utilidades
│   ├── validators.js
│   ├── errorMessages.js
│   └── constants.js
├── api/                 ← Clientes API
│   ├── axios.js
│   ├── auth.api.js
│   ├── scout.api.js
│   └── registro.api.js
├── context/             ← Context providers
│   ├── AuthContext.jsx
│   ├── ScoutContext.jsx
│   └── AppContext.jsx
└── pages/               ← Páginas
```

---

## ✅ CHECKLIST DE MEJORAS FRONTEND

- [ ] Agregar hook useFormValidation
- [ ] Implementar validación en formularios
- [ ] Crear ErrorBoundary
- [ ] Agregar componente Toast
- [ ] Mejorar manejo de errores de API
- [ ] Agregar loaders/spinners
- [ ] Mejorar estilos de inputs (error state)
- [ ] AgregarlocalStorage para persistencia de sesión
- [ ] Agregar testing con Vitest
- [ ] Documentar componentes con Storybook

---

## 🚀 PASOS SIGUIENTES

1. Implementar una mejora por semana
2. Testear con múltiples usuarios
3. Recopilar feedback
4. Iterar sobre la base de feedback
