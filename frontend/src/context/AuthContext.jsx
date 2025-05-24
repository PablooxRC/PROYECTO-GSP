import { createContext, useState, useContext, useEffect } from 'react'
import axios from '../api/axios.js'
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
    const [loading, setLoading] = useState(true)

   const signin = async (data) => {
        try {
            const res = await axios.post('/signin', data);
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
            const res = await axios.post('/signup', data);
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

    const signout = async () => {
        const res = await axios.post("/signout")
        setUser(null);
        setIsAuth(false);
    }

    useEffect(() => {
        setLoading(true)
        if(Cookie.get('token')){
            //obtener datos del usuario
            axios.get('/profile').then(res => {
                setUser(res.data);
                setIsAuth(true)
            }).catch(err => {
                console.log(err)
                setUser(null);
                setIsAuth(false);
                setLoading(false)
            })
        } 
        
        setLoading(false)
    },[])
    return <AuthContext.Provider value ={{
        user,
        isAuth,
        errors, 
        signup, 
        signin,
        signout,
        loading
    }}>
        {children}
    </AuthContext.Provider>
}