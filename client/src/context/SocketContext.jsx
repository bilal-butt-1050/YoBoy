'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Get token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
        withCredentials: true,
      })

      newSocket.on('connect', () => {
        console.log('✅ Socket connected')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
        setConnected(false)
      })

      newSocket.on('users:online', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('user:online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])])
      })

      newSocket.on('user:offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId))
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
        setOnlineUsers([])
      }
    }
  }, [isAuthenticated, user])

  const value = {
    socket,
    connected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.includes(userId),
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}