'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

// Helper to get token from cookies
function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  
  for (let cookie of cookies) {
    const trimmedCookie = cookie.trim()
    if (trimmedCookie.startsWith('token=')) {
      return trimmedCookie.substring('token='.length)
    }
  }
  
  return null
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Clean up if not authenticated
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
        setOnlineUsers([])
      }
      return
    }

    const token = getTokenFromCookie()
    
    if (!token) {
      console.error('❌ No auth token found in cookies')
      return
    }

    console.log('🔌 Initializing socket with token:', token.substring(0, 20) + '...')

    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('🔴 Socket disconnected')
      setConnected(false)
    })

    newSocket.on('users:online', (users) => {
      console.log('👥 Online users:', users)
      setOnlineUsers(users)
    })

    newSocket.on('user:online', ({ userId }) => {
      console.log('🟢 User online:', userId)
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    })

    newSocket.on('user:offline', ({ userId }) => {
      console.log('🔴 User offline:', userId)
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message)
    })

    return () => {
      console.log('🧹 Cleaning up socket connection')
      newSocket.close()
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        isUserOnline: (id) => onlineUsers.includes(id),
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}