// server/index.js - Cleaned and cookie-ready
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser()); // allows reading cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup (IMPORTANT for cookies)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // allows sending cookies across domains
  })
);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ChatFlow API is running",
    version: "1.0.0",
  });
});

// Main API routes
app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.stack);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS Origin: ${process.env.CLIENT_URL}`);
});
