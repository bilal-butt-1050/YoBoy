'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '../lib/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // The cookie is automatically sent with this request
      // because of withCredentials: true in api.js
      const response = await authAPI.getMe()
      setUser(response.user)
    } catch (error) {
      // If the request fails, the user is not authenticated
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data) => {
    try {
      const response = await authAPI.signup(data)
      // The backend sets the cookie automatically
      // We just need to update the user state
      setUser(response.user)
      router.push('/chat')
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const login = async (data) => {
    try {
      const response = await authAPI.login(data)
      // The backend sets the cookie automatically
      // We just need to update the user state
      setUser(response.user)
      router.push('/chat')
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
      // The backend clears the cookie
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if the API call fails, clear local state
      setUser(null)
      router.push('/login')
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}