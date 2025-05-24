import axios from "./axios";

export const createScoutRequest = (scout) => axios.post("/scout", scout)

export const getScoutsRequest = () => axios.get("/scouts")

export const deleteScoutRequest = (ci) => axios.delete(`/scout/${ci}`)

export const getScoutRequest = ci => axios.get(`/scout/${ci}`)

export const updateScoutRequest = (ci, scout) => axios.put(`/scout/${ci}`, scout)