import express from "express";
dotenv.config();
import passport from "./config/passport.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";


const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ChatFlow API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    features: {
      emailVerification: !!process.env.RESEND_API_KEY,
      googleOAuth: !!process.env.GOOGLE_CLIENT_ID,
      githubOAuth: !!process.env.GITHUB_CLIENT_ID,
    }
  });
});

// Main API routes
app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origins:`, allowedOrigins);
  console.log(`🍪 Cookies enabled: true`);
  console.log(`📧 Email Verification: ${process.env.RESEND_API_KEY ? '✅' : '❌'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`);
  console.log(`🔐 GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? '✅' : '❌'}`);
});