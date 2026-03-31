import axios from 'axios'

// Usar variable de entorno si está disponible, sino valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

export default client;