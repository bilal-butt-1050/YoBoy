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

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) { if (socket) { socket.close(); setSocket(null); setConnected(false); setOnlineUsers([]) }; return }

    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { auth: { token }, withCredentials: true })
    setSocket(newSocket)

    newSocket.on('connect', () => setConnected(true))
    newSocket.on('disconnect', () => setConnected(false))
    newSocket.on('users:online', users => setOnlineUsers(users))
    newSocket.on('user:online', ({ userId }) => setOnlineUsers(prev => [...new Set([...prev, userId])]))
    newSocket.on('user:offline', ({ userId }) => setOnlineUsers(prev => prev.filter(id => id !== userId)))
    newSocket.on('connect_error', (err) => console.error('Socket connection error:', err))

    return () => newSocket.close()
  }, [isAuthenticated, user])

  return <SocketContext.Provider value={{ socket, connected, onlineUsers, isUserOnline: (id) => onlineUsers.includes(id) }}>{children}</SocketContext.Provider>
}
