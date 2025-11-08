// ============================================
// SOCKET.IO BASIC AUTH SETUP
// server/socket.js
// ============================================

import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from './models/User.js'

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // ============================================
  // AUTH MIDDLEWARE
  // ============================================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('_id username name email')

      if (!user) return next(new Error('User not found'))

      socket.user = user
      console.log(`✅ Authenticated socket: ${user.username}`)
      next()
    } catch (err) {
      console.error('❌ Socket auth failed:', err.message)
      next(new Error('Invalid token'))
    }
  })

  // ============================================
  // CONNECTION HANDLER
  // ============================================
  io.on('connection', async (socket) => {
    const user = socket.user
    console.log(`🟢 User connected: ${user.username} (${socket.id})`)

    // optional: mark user online in DB
    await User.findByIdAndUpdate(user._id, {
      status: 'online',
      lastSeen: new Date()
    })

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${user.username}`)
      await User.findByIdAndUpdate(user._id, {
        status: 'offline',
        lastSeen: new Date()
      })
    })
  })

  console.log('✅ Socket.IO initialized with auth only')
  return io
}
