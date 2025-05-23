import axios from "./axios";

export const createScoutRequest = (scout) => axios.post("/scout", scout)

export const getScoutsRequest = () => axios.get("/scouts")
