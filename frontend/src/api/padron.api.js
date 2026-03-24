import axios from "./axios";

export const getPadronByCi = (ci) => axios.get(`/padron/${ci}`);

export const listPadron = () => axios.get("/padron");

export const createPadron = (data) => axios.post("/padron", data);

export const updatePadron = (ci, data) => axios.put(`/padron/${ci}`, data);

export const deletePadron = (ci) => axios.delete(`/padron/${ci}`);
