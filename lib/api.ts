import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('token')
      window.location.href = '/auth/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  getSessions: () => api.get('/auth/sessions'),
  revokeCurrentSession: () => api.post('/auth/sessions/revoke'),
  
  getMe: () => api.get('/auth/me'),
  
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
  
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`),
  
  resendVerification: () =>
    api.post('/auth/resend-verification'),
  
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  
  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  
  enable2FA: () => api.post('/auth/enable-2fa'),
  
  disable2FA: (data: { password: string }) =>
    api.post('/auth/disable-2fa', data),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  updatePreferences: (data: any) => api.put('/users/preferences', data),
  
  uploadAvatar: (data: { avatarUrl: string }) => api.post('/users/avatar', data),
  
  deleteAccount: (data: { password: string }) => api.delete('/users/account', { data }),
  
  requestEmailChange: (data: { newEmail: string }) => 
    api.post('/users/request-email-change', data),
  
  verifyEmailChange: (data: { otp: string }) =>
    api.post('/users/verify-email-change', data),
}

// Categories API
export const categoriesAPI = {
  getCategories: (params?: { type?: string }) => 
    api.get('/categories', { params }),
  
  getCategory: (id: string) => api.get(`/categories/${id}`),
  
  createCategory: (data: any) => api.post('/categories', data),
  
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
  
  createDefaultCategories: () => api.post('/categories/defaults'),
}

// Transactions API
export const transactionsAPI = {
  getTransactions: (params?: any) => 
    api.get('/transactions', { params }),
  
  getTransaction: (id: string) => api.get(`/transactions/${id}`),
  
  createTransaction: (data: any) => api.post('/transactions', data),
  
  updateTransaction: (id: string, data: any) => api.put(`/transactions/${id}`, data),
  
  deleteTransaction: (id: string) => api.delete(`/transactions/${id}`),
  
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/transactions/summary', { params }),
  
  getRecent: (params?: { limit?: number }) =>
    api.get('/transactions/recent', { params }),
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (params?: { period?: string }) =>
    api.get('/analytics/dashboard', { params }),
  
  getTrends: (params?: { period?: string; type?: string }) =>
    api.get('/analytics/trends', { params }),
  
  getCategories: (params?: { period?: string; type?: string }) =>
    api.get('/analytics/categories', { params }),
  
  getComparison: () => api.get('/analytics/comparison'),
}

export default api
