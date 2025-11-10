import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import User from './models/User.js'
import Message from './models/Message.js'
import Chat from './models/Chat.js'

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
    transports: ['websocket', 'polling'],
  })

  // Track all sockets per user
  const onlineUsers = new Map() // userId -> Set<socketId>

  // Extract token from cookie or handshake auth
  function extractToken(socket) {
    const cookieHeader = socket.handshake.headers?.cookie
    if (cookieHeader) {
      try { return cookie.parse(cookieHeader).token } catch {}
    }
    return socket.handshake.auth?.token
  }

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket)
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded?.id) return next(new Error('Invalid token payload'))

      const user = await User.findById(decoded.id).select('_id name username avatar status')
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch (err) {
      console.error('Socket auth error:', err.message)
      next(new Error('Socket authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.user
    const userId = user._id.toString()
    console.log(`🟢 Socket connected: ${user.username} (${socket.id})`)

    // Track multiple sockets
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
    onlineUsers.get(userId).add(socket.id)
    socket.join(`user:${userId}`)
    io.emit('user:status', { userId, status: 'online' })

    ;(async () => {
      try {
        await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: Date.now() })
        const chats = await Chat.find({ members: userId }).select('_id')
        for (const c of chats) socket.join(`chat:${c._id.toString()}`)
      } catch (err) {
        console.warn('Failed user setup:', err.message)
      }
    })()

    socket.on('message:send', async (payload, ack) => {
      try {
        const { chatId, content, messageType = 'text' } = payload || {}
        if (!chatId || !content?.trim()) return ack?.({ success: false, message: 'Invalid payload' })

        const chat = await Chat.findById(chatId).select('members isGroup')
        if (!chat) return ack?.({ success: false, message: 'Chat not found' })

        if (!chat.members.map(String).includes(userId)) return ack?.({ success: false, message: 'Not a member' })

        const message = await Message.create({ sender: userId, chat: chatId, content: content.trim(), messageType })
        chat.lastMessage = message._id
        await chat.save()
        await message.populate([{ path: 'sender', select: '_id name username avatar' }])

        io.to(`chat:${chatId}`).emit('message:receive', message)
        console.log(`⬅️ message:receive emitted to chat:${chatId}`)
        ack?.({ success: true, message })
      } catch (err) {
        console.error('message:send error:', err.message)
        ack?.({ success: false, message: 'Server error' })
      }
    })

    socket.on('message:read', async ({ messageId }, ack) => {
      try {
        if (!messageId) return ack?.({ success: false, message: 'messageId required' })

        const message = await Message.findById(messageId)
        if (!message) return ack?.({ success: false, message: 'Message not found' })

        const chat = await Chat.findById(message.chat).select('members')
        if (!chat || !chat.members.map(String).includes(userId)) return ack?.({ success: false, message: 'Not authorized' })

        if (!message.isRead) await message.updateOne({ isRead: true })

        io.to(`chat:${message.chat.toString()}`).emit('message:read', { messageId, by: userId })
        ack?.({ success: true })
      } catch (err) {
        console.error('message:read error:', err.message)
        ack?.({ success: false, message: 'Server error' })
      }
    })

    socket.on('chat:join', async ({ chatId }, ack) => {
      try {
        if (!chatId) return ack?.({ success: false, message: 'chatId required' })
        const chat = await Chat.findById(chatId).select('members')
        if (!chat) return ack?.({ success: false, message: 'Chat not found' })
        if (!chat.members.map(String).includes(userId)) return ack?.({ success: false, message: 'Not a member' })

        socket.join(`chat:${chatId}`)
        ack?.({ success: true })
      } catch (err) {
        console.error('chat:join error:', err.message)
        ack?.({ success: false, message: 'Server error' })
      }
    })

    socket.on('chat:leave', ({ chatId }, ack) => {
      if (!chatId) return ack?.({ success: false, message: 'chatId required' })
      socket.leave(`chat:${chatId}`)
      ack?.({ success: true })
    })

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Socket disconnected: ${user.username} (${socket.id}) reason=${reason}`)
      const userSockets = onlineUsers.get(userId)
      if (userSockets) {
        userSockets.delete(socket.id)
        if (userSockets.size === 0) {
          onlineUsers.delete(userId)
          io.emit('user:status', { userId, status: 'offline' })
          ;(async () => {
            try {
              await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: Date.now() })
            } catch (err) {
              console.warn('Failed to set user offline:', err.message)
            }
          })()
        }
      }
    })
  })

  console.log('✅ Socket.IO initialized (multi-tab aware)')
  return io
}
