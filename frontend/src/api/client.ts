import axios from 'axios'

const TOKEN_KEY = 'cost_tracker_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // If we get a 401/403 on a non-auth endpoint, the token is invalid/expired
      const url = error.config?.url ?? ''
      if (!url.startsWith('/auth/')) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('cost_tracker_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
