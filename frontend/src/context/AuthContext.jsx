import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import Cookie from 'js-cookie'
export const AuthContext = createContext()

export const useAuth = () =>{
    const context = useContext(AuthContext)
    if(!context){
        throw new Error ('useAuth error')
    }
    return context
}

export function AuthProvider ({children}){
    const[user, setUser ] = useState(null)
    const [isAuth, setIsAuth] = useState(false)
    const [errors, setErrors] = useState(null)

   const signin = async (data) => {
        try {
            const res = await axios.post('http://localhost:3000/api/signin', data, {
                withCredentials: true
            });
            console.log(res.data);
            setUser(res.data);
            setIsAuth(true);
            setErrors(null); // Limpia errores anteriores
            return res.data;
        } catch (error) {
            console.log(error);

            // Revisa si error.response y error.response.data existen
            const responseData = error?.response?.data;

            if (Array.isArray(responseData?.error)) {
                // Si 'error' es un array de mensajes de error
                setErrors(responseData.error);
            } else if (typeof responseData?.message === 'string') {
                // Si solo hay un mensaje
                setErrors([responseData.message]);
            } else {
                // En caso de estructura desconocida
                setErrors(['Error desconocido']);
            }
        }
    }



    
    const signup = async(data) =>{
       try {
            const res = await axios.post('http://localhost:3000/api/signup', data, {
            withCredentials: true
            });
            console.log(res.data)
            setUser(res.data);
            setIsAuth(true);
            setErrors(null); // Limpia errores anteriores
            return res.data
       } catch (error) {
            console.log(error);
            // Revisa si error.response y error.response.data existen
            const responseData = error?.response?.data;
            if (Array.isArray(responseData?.error)) {
                // Si 'error' es un array de mensajes de error
                setErrors(responseData.error);
            } else if (typeof responseData?.message === 'string') {
                // Si solo hay un mensaje
                setErrors([responseData.message]);
            } else {
                // En caso de estructura desconocida
                setErrors(['Error desconocido']);
            }
       }
    }
    useEffect(() => {
        console.log('js-cookie get all:', Cookie.get('token'));   
        if(Cookie.get('token')){
            //obtener datos del usuario
            
        } 
    },[])
    return <AuthContext.Provider value ={{
        user,
        isAuth,
        errors, 
        signup, 
        signin
    }}>
        {children}
    </AuthContext.Provider>
}