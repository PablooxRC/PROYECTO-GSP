import axios from './axios'

export const sendReport = (payload) => {
  return axios.post('/admins/send-report', payload)
}

export default { sendReport }
