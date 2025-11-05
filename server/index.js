import express from 'express'
import { createServer } from 'http'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js'
import routes from './routes/index.js'
import initSocket from './socket.js'

dotenv.config()
const app = express()
const httpServer = createServer(app)

// middleware
app.use(cookieParser())
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(passport.initialize())
app.use('/api', routes)

// base route
app.get('/', (req, res) => res.json({ message: 'Server running' }))

// connect DB + start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const io = initSocket(httpServer)
    app.set('io', io)
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => console.log(`🚀 Server on ${PORT}`))
  })
  .catch((err) => console.error('DB error:', err))
