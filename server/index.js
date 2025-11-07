import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js'
import routes from './routes/index.js'
import errorHandler from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'

dotenv.config()

const app = express()

// Middleware
app.use(cookieParser())
app.use(express.json())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(passport.initialize())

// Routes
app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({
    message: 'ChatFlow API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
  })
})

// Error handler
app.use(errorHandler)

// Connect to DB and start server
connectDB(app)
