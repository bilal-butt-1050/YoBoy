'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '../lib/api'

const AuthContext = createContext()
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    try {
      const res = await authAPI.getMe()
      setUser(res.user)
    } catch { setUser(null) }
    finally { setLoading(false) }
  }

  const signup = async (data) => {
    try { const res = await authAPI.signup(data); return { success: true, message: res.message } }
    catch (err) { return { success: false, message: err.message } }
  }

  const login = async (data) => {
    try {
      const res = await authAPI.login(data)
      setUser(res.user)
      router.push('/dashboard')
      return { success: true }
    } catch (err) { return { success: false, message: err.message } }
  }

  const logout = async () => {
    try { await authAPI.logout() } finally { setUser(null); router.push('/login') }
  }

  return <AuthContext.Provider value={{ user, loading, signup, login, logout, isAuthenticated: !!user, checkAuth }}>{children}</AuthContext.Provider>
}
