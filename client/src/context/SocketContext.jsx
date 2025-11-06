'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

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
    const newSocket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('✅ Socket connected', newSocket.id)
      setConnected(true)
    })

    newSocket.on('disconnect', () => setConnected(false))

    newSocket.on('users:online', (users) => setOnlineUsers(users))
    newSocket.on('user:online', ({ userId }) =>
      setOnlineUsers((prev) => [...new Set([...prev, userId])])
    )
    newSocket.on('user:offline', ({ userId }) =>
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    )

    return () => newSocket.disconnect()
  }, [])

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
