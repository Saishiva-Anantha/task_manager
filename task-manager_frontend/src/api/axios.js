import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

// Request interceptor — attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 (expired token) with auto-refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't already retried, attempt a token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${API.defaults.baseURL.replace('/api', '')}/api/token/refresh/`,
            { refresh: refreshToken }
          )
          const newAccessToken = res.data.access
          localStorage.setItem('access_token', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return API(originalRequest)
        } catch (refreshError) {
          // Refresh token is also expired — force logout
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('username')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token — force logout
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default API