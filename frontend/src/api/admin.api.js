import axios from './axios'

export const sendReport = (payload) => {
  return axios.post('/admin/send-report', payload)
}

export const getDirigentes = () => {
  return axios.get('/admin/dirigentes-list')
}

export const updateDirigente = (ci, payload) => {
  return axios.put(`/admin/dirigentes/${ci}`, payload)
}

export const deleteDirigente = (ci) => {
  return axios.delete(`/admin/dirigentes/${ci}`)
}

export const getScoutsAdmin = (from, to) => {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)
  return axios.get(`/scouts/admin/all${params.toString() ? '?' + params.toString() : ''}`)
}

export default { sendReport, getDirigentes, updateDirigente, deleteDirigente, getScoutsAdmin }
