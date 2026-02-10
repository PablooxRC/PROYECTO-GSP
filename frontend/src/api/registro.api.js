import axios from './axios'

export const getRegistros = async () => {
    try {
        const res = await axios.get('/registros')
        return res.data
    } catch (error) {
        throw error
    }
}

export const getRegistrosByScout = async (scout_ci) => {
    try {
        const res = await axios.get(`/registros/scout/${scout_ci}`)
        return res.data
    } catch (error) {
        throw error
    }
}

export const getRegistro = async (id) => {
    try {
        const res = await axios.get(`/registros/${id}`)
        return res.data
    } catch (error) {
        throw error
    }
}

export const createRegistro = async (data) => {
    try {
        const res = await axios.post('/registros', data)
        return res.data
    } catch (error) {
        throw error
    }
}

export const updateRegistro = async (id, data) => {
    try {
        const res = await axios.put(`/registros/${id}`, data)
        return res.data
    } catch (error) {
        throw error
    }
}

export const deleteRegistro = async (id) => {
    try {
        const res = await axios.delete(`/registros/${id}`)
        return res.data
    } catch (error) {
        throw error
    }
}

export const getUnidades = async () => {
    try {
        const res = await axios.get('/registros/unidades')
        return res.data
    } catch (error) {
        throw error
    }
}
