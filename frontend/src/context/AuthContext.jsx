import { createContext, useState, useContext, useEffect } from "react";
import axios from "../api/axios.js"; // Asegúrate de que esta ruta sea correcta para tu instancia de axios
import Cookie from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth error: El hook useAuth debe usarse dentro de un AuthProvider",
    ); // Mensaje más descriptivo
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [errors, setErrors] = useState(null); // Lo mantendremos como null. Si hay errores, será un array de strings.
  const [loading, setLoading] = useState(true); // Indica si se está verificando la sesión inicial

  const getErrorMessages = (error, fallbackMessage) => {
    const responseData = error?.response?.data;

    if (Array.isArray(responseData?.error)) return responseData.error;
    if (Array.isArray(responseData?.errors)) return responseData.errors;
    if (typeof responseData?.error?.message === "string") {
      return [responseData.error.message];
    }
    if (typeof responseData?.message === "string")
      return [responseData.message];

    if (error?.code === "ERR_NETWORK") {
      return [
        "No se pudo conectar con el servidor. Verifica que el backend este ejecutandose.",
      ];
    }

    if (error?.response?.status === 401) {
      return ["Correo o contrasena incorrectos."];
    }

    return [fallbackMessage];
  };

  // Función para iniciar sesión
  const signin = async (data) => {
    setErrors(null); // 1. Limpiar errores anteriores al inicio de cada intento de login
    try {
      const res = await axios.post("/signin", data); // Asegúrate que esta ruta coincida con tu backend
      console.log("Respuesta de signin exitoso:", res.data);
      setUser(res.data.data);
      setIsAuth(true);
      return res.data.data; // Devuelve los datos del usuario en caso de éxito
    } catch (error) {
      console.log("Error en signin:", error.response || error); // Log más descriptivo para depuración
      setErrors(getErrorMessages(error, "Ocurrio un error al iniciar sesion."));

      setUser(null); // 3. Asegura que el usuario sea nulo en caso de fallo
      setIsAuth(false); // 4. Asegura que NO esté autenticado en caso de fallo
      return null; // 5. ¡IMPORTANTE! Devuelve null para indicar que el login falló
      // Esto es crucial para que `if (user)` en LoginPage funcione correctamente
    }
  };

  // Función para registrar un nuevo usuario
  const signup = async (data) => {
    setErrors(null); // Limpiar errores al inicio de cada intento de registro
    try {
      const res = await axios.post("/signup", data); // Asegúrate que esta ruta coincida con tu backend
      console.log("Respuesta de signup exitoso:", res.data);
      setUser(res.data.data);
      setIsAuth(true);
      return res.data;
    } catch (error) {
      console.log("Error en signup:", error.response || error);

      setErrors(getErrorMessages(error, "Ocurrio un error al registrarse."));
      setUser(null);
      setIsAuth(false);
      return null; // ¡IMPORTANTE! Devuelve null para indicar que el registro falló
    }
  };

  // Función para cerrar sesión
  const signout = async () => {
    try {
      await axios.post("/signout"); // Asegúrate que esta ruta coincida con tu backend
      setUser(null);
      setIsAuth(false);
      setErrors(null); // Limpiar errores al cerrar sesión
      Cookie.remove("token"); // Asegurarse de que la cookie se elimine del navegador
    } catch (error) {
      console.error("Error al cerrar sesión en el frontend:", error);
      setErrors(["No se pudo cerrar la sesión correctamente."]); // Mensaje para el usuario
    }
  };

  // useEffect para verificar la autenticación al cargar la aplicación
  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);
      try {
        // La cookie httpOnly se envía automáticamente con withCredentials
        const res = await axios.get("/profile");
        setUser(res.data.data);
        setIsAuth(true);
        setErrors(null);
      } catch (err) {
        setUser(null);
        setIsAuth(false);
      }
      setLoading(false);
    };

    checkLogin(); // Llama a la función para verificar el login
  }, []); // Se ejecuta una sola vez al montar el componente

  // Opcional: useEffect para limpiar automáticamente los errores después de un tiempo
  useEffect(() => {
    if (errors && errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors(null);
      }, 5000); // Los errores se ocultarán después de 5 segundos
      return () => clearTimeout(timer); // Limpia el temporizador si los errores cambian o el componente se desmonta
    }
  }, [errors]); // Se ejecuta cada vez que el estado 'errors' cambia

  // Provee los valores a los componentes que usan este contexto
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        errors, // Proporciona los errores para que los componentes puedan mostrarlos
        signup,
        signin,
        signout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
