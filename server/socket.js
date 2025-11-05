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
    transports: ['websocket', 'polling'], // Allow both for reliability
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
        console.error('❌ No token provided in socket handshake')
        return next(new Error('Authentication error: No token'))
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      // Fetch user from database
      const user = await User.findById(decoded.id).select('_id username name email status')
      
      if (!user) {
        console.error('❌ User not found:', decoded.id)
        return next(new Error('Authentication error: User not found'))
      }

      // Attach user to socket
      socket.user = user
      console.log('✅ Socket authenticated:', user.username)
      next()
    } catch (err) {
      console.error('❌ Socket auth failed:', err.message)
      next(new Error('Authentication error: Invalid token'))
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

    // Update user status in database
    await User.findByIdAndUpdate(userId, { 
      status: 'online',
      lastSeen: new Date()
    })

    // Broadcast updated online users list to everyone
    io.emit('users:online', Array.from(onlineUsers.keys()))

    // Notify others this user came online
    socket.broadcast.emit('user:online', { userId })

    // ============================================
    // JOIN CONVERSATION ROOM
    // ============================================
    socket.on('conversation:join', (otherUserId) => {
      if (!otherUserId) return

      // Create deterministic room ID (sorted user IDs)
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

        // Create deterministic room/conversation ID
        const conversationId = [userId, receiverId].sort().join('-')

        // Save message to database
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content: content.trim(),
          messageType,
          conversationId
        })

        // Populate sender/receiver info
        await message.populate([
          { path: 'sender', select: '_id username name email avatar' },
          { path: 'receiver', select: '_id username name email avatar' }
        ])

        console.log(`💬 Message sent in room ${conversationId}`)

        // Emit to room (includes sender and receiver)
        io.to(conversationId).emit('message:receive', message)

        // Also send acknowledgment to sender
        socket.emit('message:sent', message)

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
    // DISCONNECT HANDLER
    // ============================================
    socket.on('disconnect', async (reason) => {
      console.log(`🔴 User disconnected: ${username} (${reason})`)

      // Remove from online users
      onlineUsers.delete(userId)

      // Update user status
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      })

      // Broadcast updated online users
      io.emit('users:online', Array.from(onlineUsers.keys()))

      // Notify others this user went offline
      socket.broadcast.emit('user:offline', { userId })
    })

    // ============================================
    // ERROR HANDLER
    // ============================================
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })
  })

  // ============================================
  // SERVER-LEVEL ERROR HANDLER
  // ============================================
  io.engine.on('connection_error', (err) => {
    console.error('❌ Socket.IO connection error:', err.code, err.message)
  })

  console.log('✅ Socket.IO initialized')
  return io
}