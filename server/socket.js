import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import Message from './models/Message.js'

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  })

  const onlineUsers = new Map()

  // --- Auth middleware ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('No token provided'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('username name email')
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch (err) {
      console.error('Socket auth failed:', err.message)
      next(new Error('Authentication error'))
    }
  })

  // --- Core events ---
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    onlineUsers.set(userId, socket.id)
    console.log(`🟢 ${socket.user.username} connected`)

    // broadcast updated list
    io.emit('users:online', Array.from(onlineUsers.keys()))

    // join room between two users
    socket.on('join', (otherUserId) => {
      const roomId = [userId, otherUserId].sort().join('-')
      socket.join(roomId)
    })

    // send message
    socket.on('message:send', async ({ receiverId, content }) => {
      if (!receiverId || !content) return
      const roomId = [userId, receiverId].sort().join('-')

      const message = await Message.create({
        sender: userId,
        receiver: receiverId,
        content,
        conversationId: roomId,
      })

      await message.populate([
        { path: 'sender', select: 'username name email' },
        { path: 'receiver', select: 'username name email' },
      ])

      io.to(roomId).emit('message:receive', message)
    })

    // handle disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      console.log(`🔴 ${socket.user.username} disconnected`)
      io.emit('users:online', Array.from(onlineUsers.keys()))
    })
  })

  return io
}
