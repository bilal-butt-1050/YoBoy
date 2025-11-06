// ============================================
// SIMPLIFIED SOCKET.IO SETUP
// server/socket.js
// ============================================

import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import Message from './models/Message.js'

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

  const onlineUsers = new Map() // userId -> socketId

  // ============================================
  // AUTHENTICATION MIDDLEWARE
  // ============================================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      
      if (!token) {
        console.error('❌ No token in socket handshake')
        return next(new Error('Authentication required'))
      }

      console.log('🪪 Socket handshake auth:', socket.handshake.auth)

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('_id username name email')
      
      if (!user) {
        console.error('❌ User not found:', decoded.id)
        return next(new Error('User not found'))
      }

      socket.user = user
      console.log('✅ Socket authenticated:', user.username)
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
    const userId = socket.user._id.toString()
    const username = socket.user.username

    console.log(`🟢 User connected: ${username} (${socket.id})`)

    // Store online user
    onlineUsers.set(userId, socket.id)

    // Update user status
    await User.findByIdAndUpdate(userId, { 
      status: 'online',
      lastSeen: new Date()
    })

    // Broadcast online users
    io.emit('users:online', Array.from(onlineUsers.keys()))
    socket.broadcast.emit('user:online', { userId })

    // ============================================
    // JOIN CONVERSATION
    // ============================================
    socket.on('conversation:join', (otherUserId) => {
      if (!otherUserId) return

      const roomId = [userId, otherUserId].sort().join('-')
      socket.join(roomId)
      
      console.log(`📥 ${username} joined room: ${roomId}`)
    })

    // ============================================
    // SEND MESSAGE
    // ============================================
    socket.on('message:send', async (messageData) => {
      try {
        const { receiverId, content, messageType = 'text' } = messageData

        if (!receiverId || !content?.trim()) {
          return socket.emit('error', { message: 'Invalid message data' })
        }

        // Create room ID
        const conversationId = [userId, receiverId].sort().join('-')

        // Save to database
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          messageType,
          conversationId
        })

        // Populate sender/receiver
        await message.populate([
          { path: 'sender', select: '_id username name email avatar' },
          { path: 'receiver', select: '_id username name email avatar' }
        ])

        console.log(`💬 Message sent in room ${conversationId}`)

        // Emit to room (both sender and receiver)
        io.to(conversationId).emit('message:receive', message)

      } catch (err) {
        console.error('❌ Error sending message:', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ============================================
    // TYPING INDICATORS
    // ============================================
    socket.on('typing:start', (receiverId) => {
      if (!receiverId) return
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', { userId, username })
      }
    })

    socket.on('typing:stop', (receiverId) => {
      if (!receiverId) return
      const receiverSocketId = onlineUsers.get(receiverId)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', { userId })
      }
    })

    // ============================================
    // DISCONNECT
    // ============================================
    socket.on('disconnect', async (reason) => {
      console.log(`🔴 User disconnected: ${username} (${reason})`)

      onlineUsers.delete(userId)

      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      })

      io.emit('users:online', Array.from(onlineUsers.keys()))
      socket.broadcast.emit('user:offline', { userId })
    })

    // ============================================
    // ERROR HANDLER
    // ============================================
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  })

  console.log('✅ Socket.IO initialized')
  return io
}