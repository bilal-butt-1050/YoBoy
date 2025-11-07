import mongoose from 'mongoose'
import { createServer } from 'http'
import initSocket from '../socket.js'

const connectDB = async (app) => {
  const PORT = process.env.PORT || 5000

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected successfully')

    // Create HTTP + Socket server
    const httpServer = createServer(app)
    const io = initSocket(httpServer)
    app.set('io', io)

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
      console.log('📡 Socket.IO enabled')
    })
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }

  process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM received, shutting down gracefully...')
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed')
      process.exit(0)
    })
  })
}

export default connectDB
