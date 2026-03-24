import axios from "./axios";

export const sendReport = (payload) => {
  // Asegurar que el campo se llama recipient_email para el backend
  const data = {
    ...payload,
    recipient_email: payload.email,
  };
  delete data.email;
  return axios.post("/admin/send-report", data);
};

export const getDirigentes = () => {
  return axios.get("/admin/dirigentes-list");
};

export const getDirigente = (ci) => {
  return axios.get(`/admin/dirigentes/${ci}`);
};

export const getDirigentesForReport = () => {
  return axios.get("/admin/dirigentes-report");
};

export const updateDirigente = (ci, payload) => {
  return axios.put(`/admin/dirigentes/${ci}`, payload);
};

export const deleteDirigente = (ci) => {
  return axios.delete(`/admin/dirigentes/${ci}`);
};

export const getScoutsAdmin = (from, to) => {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  return axios.get(
    `/scouts/admin/all${params.toString() ? "?" + params.toString() : ""}`,
  );
};

export default {
  sendReport,
  getDirigentes,
  getDirigente,
  getDirigentesForReport,
  updateDirigente,
  deleteDirigente,
  getScoutsAdmin,
};
