/**
 * index.js
 * Cleaned / hardened server entry for ChatFlow
 *
 * Key changes:
 * - tightened CORS to reliably allow cookies and dev/prod origins
 * - improved socket auth handling and defensive checks
 * - clearer logging and safer disconnect
 * - consistent origin list usage between Express and Socket.IO
 */

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js' // your passport config file (default export)
import routes from './routes/index.js'
import User from './models/User.js'
import Message from './models/Message.js'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// ---------------------------
// Basic middleware
// ---------------------------
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// ---------------------------
// CORS configuration
// ---------------------------
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

const allowedOrigins = new Set([
  CLIENT_URL,
  'http://localhost:3000',
  // add any other frontends you use
])

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true)
      if (allowedOrigins.has(origin)) return callback(null, true)
      console.warn('Blocked CORS request from:', origin)
      return callback(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ---------------------------
// Socket.IO configuration
// ---------------------------
//
// Note: Socket.IO needs CORS configured similarly. We pass the same allowed origins as an array.
const socketOrigins = Array.from(allowedOrigins)

const io = new Server(httpServer, {
  cors: {
    origin: socketOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
})

// ---------------------------
// Socket auth middleware
// ---------------------------
io.use(async (socket, next) => {
  try {
    // Accept token via handshake.auth.token (frontend should set this)
    // or via cookie if frontend attaches it in headers (less common for socket.io)
    const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.match?.(/(^|; )token=([^;]+)/)?.[2]

    if (!token) return next(new Error('Authentication error: no token provided'))

    // verify token (throws on invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded?.id) return next(new Error('Authentication error: invalid token payload'))

    const user = await User.findById(decoded.id).select('+username +_id')
    if (!user) return next(new Error('Authentication error: user not found'))

    // attach minimal metadata to socket
    socket.userId = user._id.toString()
    socket.username = user.username || user.name || 'unknown'
    return next()
  } catch (err) {
    console.error('Socket auth error:', err.message || err)
    return next(new Error('Authentication error'))
  }
})

// ---------------------------
// Socket.IO logic
// ---------------------------
const onlineUsers = new Map()

io.on('connection', async (socket) => {
  try {
    console.log(`✅ User connected: ${socket.username} (${socket.userId})`)

    // mark user online (defensive)
    try {
      await User.findByIdAndUpdate(socket.userId, {
        status: 'online',
        socketId: socket.id,
        lastSeen: Date.now(),
      })
    } catch (updErr) {
      console.warn('Failed to update user status on connect:', updErr.message || updErr)
    }

    onlineUsers.set(socket.userId, socket.id)

    // broadcast online to other sockets
    io.emit('user:online', { userId: socket.userId, username: socket.username })
    // send current online list to the connected socket
    socket.emit('users:online', Array.from(onlineUsers.keys()))

    // conversation room join
    socket.on('conversation:join', (otherUserId) => {
      try {
        if (!otherUserId) return
        const roomId = [socket.userId, otherUserId].sort().join('-')
        socket.join(roomId)
      } catch (err) {
        console.error('conversation:join error', err)
      }
    })

    // send message (server persists and emits to room)
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content, messageType = 'text' } = data || {}
        if (!receiverId || !content) {
          socket.emit('message:error', { message: 'Invalid message payload' })
          return
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
        })

        await message.populate([
          { path: 'sender', select: 'name username email avatar' },
          { path: 'receiver', select: 'name username email avatar' },
        ])

        const roomId = [socket.userId, receiverId].sort().join('-')
        io.to(roomId).emit('message:receive', message)

        // optional desktop/notification ping
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:notification', {
            messageId: message._id,
            from: socket.userId,
            fromUsername: socket.username,
            content: content.substring(0, 50),
          })
        }
      } catch (err) {
        console.error('Error handling message:send', err)
        socket.emit('message:error', { message: 'Failed to send message' })
      }
    })

    // typing start/stop (relay)
    socket.on('typing:start', (receiverId) => {
      try {
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:start', { userId: socket.userId, username: socket.username })
        }
      } catch (err) {
        console.error('typing:start error', err)
      }
    })

    socket.on('typing:stop', (receiverId) => {
      try {
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:stop', { userId: socket.userId, username: socket.username })
        }
      } catch (err) {
        console.error('typing:stop error', err)
      }
    })

    // mark as read (emits read to sender)
    socket.on('message:read', async (messageId) => {
      try {
        if (!messageId) return
        const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true, readAt: Date.now() },
          { new: true }
        )
        if (message) {
          const senderId = message.sender.toString()
          const senderSocket = onlineUsers.get(senderId)
          if (senderSocket) {
            io.to(senderSocket).emit('message:read', { messageId: message._id, readAt: message.readAt })
          }
        }
      } catch (err) {
        console.error('message:read handler error', err)
      }
    })

    socket.on('disconnect', async (reason) => {
      try {
        console.log(`❌ User disconnected: ${socket.username} (${socket.userId}) — reason: ${reason}`)
        onlineUsers.delete(socket.userId)
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: Date.now(),
          socketId: null,
        })
        io.emit('user:offline', { userId: socket.userId, username: socket.username, lastSeen: Date.now() })
      } catch (err) {
        console.error('disconnect handler error', err)
      }
    })
  } catch (outerErr) {
    console.error('Socket connection handler error', outerErr)
  }
})

// attach io to express app for route-level usage (if needed)
app.set('io', io)

// ---------------------------
// Base route
// ---------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ChatFlow API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    onlineUsers: onlineUsers.size,
    features: {
      emailVerification: !!process.env.RESEND_API_KEY,
      googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
    },
  })
})

// ---------------------------
// Routes
// ---------------------------
app.use('/api', routes)

// ---------------------------
// Error handlers
// ---------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err && err.stack ? err.stack : err)
  const status = err.statusCode || err.status || 500
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err }),
  })
})

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// ---------------------------
// MongoDB connection and server start
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log('✅ MongoDB connected')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 CORS Origins:`, Array.from(allowedOrigins))
      console.log(`🍪 Cookies enabled: true`)
      console.log(`📧 Email Verification: ${process.env.RESEND_API_KEY ? '✅' : '❌'}`)
      console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`)
      console.log(`🔌 Socket.IO enabled: true`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })
