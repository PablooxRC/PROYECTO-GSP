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

      // 2. Manejo de errores basado en la respuesta del backend
      const responseData = error?.response?.data;

      if (Array.isArray(responseData?.error)) {
        // Si el backend envía { error: ["Mensaje1", "Mensaje2"] }
        setErrors(responseData.error);
      } else if (typeof responseData?.message === "string") {
        // Si el backend envía { message: "Un solo mensaje de error" }
        setErrors([responseData.message]);
      } else {
        // Error genérico para otros casos (problemas de red, servidor no responde, etc.)
        setErrors(["Ocurrió un error desconocido al iniciar sesión."]);
      }

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
      setUser(res.data);
      setIsAuth(true);
      return res.data;
    } catch (error) {
      console.log("Error en signup:", error.response || error);

      const responseData = error?.response?.data;
      if (Array.isArray(responseData?.error)) {
        setErrors(responseData.error);
      } else if (typeof responseData?.message === "string") {
        setErrors([responseData.message]);
      } else {
        setErrors(["Ocurrió un error desconocido al registrarse."]);
      }
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
      setLoading(true); // Indica que estamos verificando
      const token = Cookie.get("token"); // Obtiene el token de la cookie
      if (token) {
        try {
          // Intenta obtener el perfil del usuario usando el token
          const res = await axios.get("/profile"); // Asegúrate que esta ruta coincida con tu backend
          setUser(res.data.data);
          setIsAuth(true);
          setErrors(null); // Asegura que no haya errores si la sesión es válida
        } catch (err) {
          // Si el token es inválido, expirado o el backend falla
          console.log(
            "Error al verificar sesión con token:",
            err.response || err,
          );
          setUser(null);
          setIsAuth(false);
          Cookie.remove("token"); // Elimina el token inválido del navegador
          // setErrors(['Tu sesión ha expirado o es inválida. Inicia sesión de nuevo.']); // Opcional: mostrar un mensaje de error persistente
        }
      } else {
        // No hay token, entonces no está autenticado
        setUser(null);
        setIsAuth(false);
      }
      setLoading(false); // Finaliza la carga, la app está lista para renderizar
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
