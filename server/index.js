import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js'
import routes from './routes/index.js'
import initSocket from './socket.js'
import errorHandler from './middleware/errorMiddleware.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// ============================================
// MIDDLEWARE
// ============================================
app.use(cookieParser())
app.use(express.json())

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(passport.initialize())

// ============================================
// ROUTES
// ============================================
app.use('/api', routes)

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'ChatFlow API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================
const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    
    // Initialize Socket.IO AFTER database connection
    const io = initSocket(httpServer)
    app.set('io', io)
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
      console.log(`📡 Socket.IO enabled`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...')
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
})