import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // CRITICAL: This enables cookies
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url)
    console.log('🍪 Cookies being sent:', document.cookie)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (res) => {
    console.log('📥 API Response:', res.config.url, res.status)
    
    // Log if token is in response (for debugging)
    if (res.data?.token) {
      console.log('🔑 Token received in response')
    }
    
    return res.data
  },
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong'
    console.error('❌ API Error:', err.response?.status, msg)
    return Promise.reject(new Error(msg))
  }
)

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, data) => api.put(`/auth/resetpassword/${token}`, data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
}

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateStatus: (data) => api.put('/users/status', data),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
}

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (id) => api.patch(`/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
}

export default api