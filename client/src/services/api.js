import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '')
export const api = axios.create({ baseURL, timeout: 15000 })

export function getFriendlyError(error) {
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    return 'The notes API is not configured. Set VITE_API_URL in the deployment settings and rebuild the client.'
  }
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ECONNABORTED') return 'The request took too long. Please try again.'
  if (!error.response) return 'Could not reach the notes service. Check your connection and try again.'
  return 'Something went wrong. Please try again.'
}