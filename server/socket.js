// server/socket.js
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import User from './models/User.js'
import Message from './models/Message.js'
import Chat from './models/Chat.js'

/**
 * initSocket(httpServer)
 * - Authenticates using JWT stored in cookie "token" (preferred) or handshake.auth.token (fallback).
 * - Keeps an onlineUsers map (userId -> socket.id)
 * - Joins user to:
 *    - personal room: user:<userId>
 *    - chat rooms: chat:<chatId> for every Chat.members the user belongs to
 * - Handles:
 *    - message:send  -> creates Message, updates Chat.lastMessage, emits to room
 *    - message:read  -> marks message isRead and notifies sender(s)
 *    - disconnect     -> sets user offline, cleanup, broadcasts status
 */
export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Map userId -> socketId (one-to-one). If you want multi-tab support, store Set of socketIds.
  const onlineUsers = new Map()

  // Helper: extract token from cookie header or handshake.auth
  function extractToken(socket) {
    // First, try cookie header
    const cookieHeader = socket.handshake.headers?.cookie
    if (cookieHeader) {
      try {
        const parsed = cookie.parse(cookieHeader)
        if (parsed.token) return parsed.token
      } catch (e) {
        // ignore
      }
    }
    // Fallback to handshake.auth.token (client can pass this explicitly)
    return socket.handshake.auth?.token
  }

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket)
      if (!token) {
        return next(new Error('Authentication required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (!decoded?.id) return next(new Error('Invalid token payload'))

      const user = await User.findById(decoded.id).select('_id name username avatar status')
      if (!user) return next(new Error('User not found'))

      socket.user = user // attach user to socket
      return next()
    } catch (err) {
      console.error('Socket auth error:', err.message)
      return next(new Error('Socket authentication failed'))
    }
  })

  io.on('connection', async (socket) => {
    const user = socket.user
    const userId = user._id.toString()
    console.log(`🟢 Socket connected: ${user.username} (${socket.id})`)

    // store online
    onlineUsers.set(userId, socket.id)

    // join personal room (makes it easy to emit specifically to this user)
    socket.join(`user:${userId}`)

    // mark user online in DB (best-effort)
    try {
      await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: Date.now() }, { new: true })
    } catch (err) {
      console.warn('Failed to set user online in DB:', err.message)
    }

    // Join all chat rooms the user belongs to (so server can broadcast to chat:<chatId>)
    try {
      const chats = await Chat.find({ members: userId }).select('_id')
      for (const c of chats) {
        socket.join(`chat:${c._id.toString()}`)
      }
    } catch (err) {
      console.warn('Failed to join user to chat rooms:', err.message)
    }

    // broadcast user's online status to everyone (or selectively to friends/workers)
    io.emit('user:status', { userId, status: 'online' })

    // ---------- message send ----------
    // payload: { chatId, content, messageType }
    socket.on('message:send', async (payload, ack) => {
      try {
        const { chatId, content, messageType = 'text' } = payload || {}
        if (!chatId || !content || !content.trim()) {
          if (typeof ack === 'function') ack({ success: false, message: 'Invalid payload' })
          return
        }

        // Basic validation: is user member of chat?
        const chat = await Chat.findById(chatId).select('members isGroup')
        if (!chat) {
          if (typeof ack === 'function') ack({ success: false, message: 'Chat not found' })
          return
        }
        const isMember = chat.members.map(String).includes(userId)
        if (!isMember) {
          if (typeof ack === 'function') ack({ success: false, message: 'Not a member of chat' })
          return
        }

        // Persist message
        const message = await Message.create({
          sender: userId,
          chat: chatId,
          content: content.trim(),
          messageType,
        })

        // update lastMessage on chat
        chat.lastMessage = message._id
        await chat.save()

        // populate sender for emitting
        await message.populate([{ path: 'sender', select: '_id name username avatar' }])

        // Emit to chat room
        io.to(`chat:${chatId}`).emit('message:receive', message)
        console.log('⬅️ message:receive emitted to chat:', chatId);

        // ack back to sender
        if (typeof ack === 'function') ack({ success: true, message })

      } catch (err) {
        console.error('message:send error', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------- mark as read ----------
    // payload: { messageId }
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

        // Only allow marking as read if the current user is part of the chat and isn't the sender
        const chat = await Chat.findById(message.chat).select('members')
        if (!chat || !chat.members.map(String).includes(userId)) {
          if (typeof ack === 'function') ack({ success: false, message: 'Not authorized to mark read' })
          return
        }

        if (!message.isRead) {
          message.isRead = true
          await message.save()
        }

        // Notify the chat room (so sender(s) can update UI)
        io.to(`chat:${message.chat.toString()}`).emit('message:read', { messageId, by: userId })

        if (typeof ack === 'function') ack({ success: true })
      } catch (err) {
        console.error('message:read error', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------- join a chat room on demand (optional) ----------
    // payload: { chatId }
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
        console.error('chat:join', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // ---------- leave chat room (optional) ----------
    socket.on('chat:leave', ({ chatId }, ack) => {
      try {
        if (!chatId) {
          if (typeof ack === 'function') ack({ success: false, message: 'chatId required' })
          return
        }
        socket.leave(`chat:${chatId}`)
        if (typeof ack === 'function') ack({ success: true })
      } catch (err) {
        console.error('chat:leave', err.message)
        if (typeof ack === 'function') ack({ success: false, message: 'Server error' })
      }
    })

    // Disconnect cleanup
    socket.on('disconnect', async (reason) => {
      console.log(`🔴 Socket disconnected: ${user.username} (${socket.id}) reason=${reason}`)
      onlineUsers.delete(userId)

      // mark offline
      try {
        await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: Date.now() })
      } catch (err) {
        console.warn('Failed to set user offline in DB:', err.message)
      }

      // broadcast
      io.emit('user:status', { userId, status: 'offline' })
    })
  })

  console.log('✅ Socket.IO initialized (auth, chats, messages, read receipts, status)')
  return io
}
