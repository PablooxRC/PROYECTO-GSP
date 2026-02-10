import { createContext, useContext, useState } from 'react'
import * as registroApi from '../api/registro.api'

const RegistroContext = createContext()

export const useRegistro = () => {
    const context = useContext(RegistroContext)
    if (!context) {
        throw new Error('useRegistro debe ser usado dentro de RegistroProvider')
    }
    return context
}

export const RegistroProvider = ({ children }) => {
    const [registros, setRegistros] = useState([])
    const [errors, setErrors] = useState([])
    const [unidades, setUnidades] = useState([])

    const loadRegistros = async () => {
        try {
            const data = await registroApi.getRegistros()
            setRegistros(data)
        } catch (error) {
            console.error('Error cargando registros:', error)
            setErrors([error.response?.data?.message || 'Error al cargar registros'])
        }
    }

    const loadUnidades = async () => {
        try {
            const data = await registroApi.getUnidades()
            setUnidades(data)
        } catch (error) {
            console.error('Error cargando unidades:', error)
            setErrors([error.response?.data?.message || 'Error al cargar unidades'])
        }
    }

    const loadRegistro = async (id) => {
        try {
            const data = await registroApi.getRegistro(id)
            return data
        } catch (error) {
            console.error('Error cargando registro:', error)
            setErrors([error.response?.data?.message || 'Error al cargar registro'])
        }
    }

    const createRegistro = async (data) => {
        try {
            const newRegistro = await registroApi.createRegistro(data)
            setRegistros([...registros, newRegistro])
            setErrors([])
            return newRegistro
        } catch (error) {
            const message = error.response?.data?.message || 'Error al crear registro'
            setErrors([message])
            console.error('Error creando registro:', error)
            return null
        }
    }

    const updateRegistro = async (id, data) => {
        try {
            const updated = await registroApi.updateRegistro(id, data)
            setRegistros(registros.map(r => r.id === id ? updated : r))
            setErrors([])
            return updated
        } catch (error) {
            const message = error.response?.data?.message || 'Error al actualizar registro'
            setErrors([message])
            console.error('Error actualizando registro:', error)
            return null
        }
    }

    const deleteRegistro = async (id) => {
        try {
            await registroApi.deleteRegistro(id)
            setRegistros(registros.filter(r => r.id !== id))
            setErrors([])
        } catch (error) {
            const message = error.response?.data?.message || 'Error al eliminar registro'
            setErrors([message])
            console.error('Error eliminando registro:', error)
        }
    }

    return (
        <RegistroContext.Provider value={{
            registros,
            errors,
            unidades,
            setErrors,
            loadRegistros,
            loadUnidades,
            loadRegistro,
            createRegistro,
            updateRegistro,
            deleteRegistro
        }}>
            {children}
        </RegistroContext.Provider>
    )
}
