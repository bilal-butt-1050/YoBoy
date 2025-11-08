'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { usersAPI } from '@/lib/api'

const SocketContext = createContext()
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'

    // Create socket instance with cookies for auth
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      withCredentials: true,
    })
    setSocket(newSocket)

    // Handle connection
    newSocket.on('connect', async () => {
      console.log('✅ Connected to socket:', newSocket.id)
      setConnected(true)

      // Update user status to online in DB
      try {
        await usersAPI.updateStatus({ online: true })
      } catch (err) {
        console.error('❌ Failed to update online status:', err.message)
      }
    })

    // Handle disconnection
    newSocket.on('disconnect', async () => {
      console.log('❌ Disconnected from socket')
      setConnected(false)

      // Update user status to offline
      try {
        await usersAPI.updateStatus({ online: false })
      } catch (err) {
        console.error('❌ Failed to update offline status:', err.message)
      }
    })

    // Online user list events
    newSocket.on('users:online', (users) => setOnlineUsers(users))
    newSocket.on('user:online', ({ userId }) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    )
    newSocket.on('user:offline', ({ userId }) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    )

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  const isUserOnline = (id) => onlineUsers.includes(id)

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
