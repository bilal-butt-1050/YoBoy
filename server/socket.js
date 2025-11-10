// server/socket.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import User from './models/User.js'
import Message from './models/Message.js'
import Chat from './models/Chat.js'

/**
 * initSocket(httpServer)
 * Handles:
 *  - Auth via cookie or handshake token
 *  - Online status + chat room joins
 *  - message:send, message:read
 *  - chat:join, chat:leave
 *  - Disconnect cleanup
 */
export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  const onlineUsers = new Map() // userId -> socketId

  // ---------------- TOKEN EXTRACTOR (sync)
  function extractToken(socket) {
    const cookieHeader = socket.handshake.headers?.cookie
    if (cookieHeader) {
      try {
        const parsed = cookie.parse(cookieHeader)
        if (parsed.token) return parsed.token
      } catch {}
    }
    return socket.handshake.auth?.token
  }

  // ---------------- AUTH MIDDLEWARE (async)
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

  // ---------------- CONNECTION HANDLER (split sync + async)
  io.on('connection', (socket) => {
    const user = socket.user
    const userId = user._id.toString()
    console.log(`🟢 Socket connected: ${user.username} (${socket.id})`)

    // Sync setup
    onlineUsers.set(userId, socket.id)
    socket.join(`user:${userId}`)
    io.emit('user:status', { userId, status: 'online' })

    // Async setup (DB ops)
    ;(async () => {
      try {
        await User.findByIdAndUpdate(userId, {
          status: 'online',
          lastSeen: Date.now(),
        })

        const chats = await Chat.find({ members: userId }).select('_id')
        for (const c of chats) socket.join(`chat:${c._id.toString()}`)
      } catch (err) {
        console.warn('Failed user setup:', err.message)
      }
    })()

    // ---------------- MESSAGE:SEND (async)
    socket.on('message:send', async (payload, ack) => {
      try {
        const { chatId, content, messageType = 'text' } = payload || {}
        if (!chatId || !content?.trim()) {
          if (typeof ack === 'function') ack({ success: false, message: 'Invalid payload' })
          return
        }

        const chat = await Chat.findById(chatId).select('members isGroup')
        if (!chat) {
          if (typeof ack === 'function') ack({ success: false, message: 'Chat not found' })
          return
        }

        const isMember = chat.members.map(String).includes(userId)
        if (!isMember) {
          if (typeof ack === 'function') ack({ success: false, message: 'Not a member' })
          return
        }

        // Create + populate message
        const message = await Message.create({
          sender: userId,
          chat: chatId,
          content: content.trim(),
          messageType,
        })
        chat.lastMessage = message._id
        await chat.save()
        await message.populate([{ path: 'sender', select: '_id name username avatar' }])

        // Emit to chat room (not to sender directly)
        io.to(`chat:${chatId}`).emit('message:receive', message)
        console.log('⬅️ message:receive emitted to chat:', chatId)

        if (typeof ack === 'function') ack({ success: true, message })
      } catch (err) {
        console.error('message:send error', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------------- MESSAGE:READ (async)
    socket.on('message:read', async ({ messageId }, ack) => {
      try {
        if (!messageId) {
          if (typeof ack === 'function') ack({ success: false, message: 'messageId required' })
          return
        }

        const message = await Message.findById(messageId)
        if (!message) {
          if (typeof ack === 'function') ack({ success: false, message: 'Message not found' })
          return
        }

        const chat = await Chat.findById(message.chat).select('members')
        if (!chat || !chat.members.map(String).includes(userId)) {
          if (typeof ack === 'function') ack({ success: false, message: 'Not authorized' })
          return
        }

        if (!message.isRead) {
          message.isRead = true
          await message.save()
        }

        io.to(`chat:${message.chat.toString()}`).emit('message:read', { messageId, by: userId })
        if (typeof ack === 'function') ack({ success: true })
      } catch (err) {
        console.error('message:read error', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------------- CHAT:JOIN (async)
    socket.on('chat:join', async ({ chatId }, ack) => {
      try {
        if (!chatId) {
          if (typeof ack === 'function') ack({ success: false, message: 'chatId required' })
          return
        }

        const chat = await Chat.findById(chatId).select('members')
        if (!chat) {
          if (typeof ack === 'function') ack({ success: false, message: 'Chat not found' })
          return
        }

        if (!chat.members.map(String).includes(userId)) {
          if (typeof ack === 'function') ack({ success: false, message: 'Not a member' })
          return
        }

        socket.join(`chat:${chatId}`)
        if (typeof ack === 'function') ack({ success: true })
      } catch (err) {
        console.error('chat:join error', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------------- CHAT:LEAVE (sync)
    socket.on('chat:leave', ({ chatId }, ack) => {
      if (!chatId) {
        if (typeof ack === 'function') ack({ success: false, message: 'chatId required' })
        return
      }
      socket.leave(`chat:${chatId}`)
      if (typeof ack === 'function') ack({ success: true })
    })

    // ---------------- DISCONNECT (split)
    socket.on('disconnect', (reason) => {
      console.log(`🔴 Disconnected: ${user.username} (${socket.id}) reason=${reason}`)
      onlineUsers.delete(userId)
      io.emit('user:status', { userId, status: 'offline' })

      // async cleanup
      ;(async () => {
        try {
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen: Date.now(),
          })
        } catch (err) {
          console.warn('Failed to set user offline:', err.message)
        }
      })()
    })
  })

  console.log('✅ Socket.IO initialized with auth, chats, and messages.')
  return io
}
