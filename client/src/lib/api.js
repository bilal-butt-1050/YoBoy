import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // CRITICAL: for cookies
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url)
    console.log('🍪 Cookies being sent:', document.cookie)
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong'
    console.error('❌ API Error:', err.response?.status, msg)
    return Promise.reject(new Error(msg))
  }
)

// -------- AUTH API --------
export const authAPI = {
  signup: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
}

// -------- USERS API --------
export const usersAPI = {
  getUsers: () => api.get('/users'),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateStatus: (status) => api.put('/users/status', { status }),
}

// -------- CHATS API --------
export const chatsAPI = {
  createOrGetDM: (userId) => api.post('/chats/dm', { userId }),
  createGroupChat: (data) => api.post('/chats/group', data),
  getUserChats: () => api.get('/chats'),
}

// -------- MESSAGES API --------
export const messagesAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (chatId) => api.get(`/messages/${chatId}`),
  markMessageAsRead: (messageId) => api.patch(`/messages/${messageId}/read`),
}

export default api