import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/authRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dreamspace";

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("-------------------------------------------");
    console.log("✅ DATABASE: MongoDB Connected Successfully");
    console.log("-------------------------------------------");
  })
  .catch((err) => {
    console.error("-------------------------------------------");
    console.error("❌ DATABASE ERROR:", err);
    console.error("-------------------------------------------");
  });

/* ===============================
   SERVE REACT FRONTEND (PRODUCTION)
================================ */

const __dirname1 = path.resolve();

app.use(express.static(path.join(__dirname1, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname1, "../frontend/dist/index.html"));
});

/* ===============================
   START SERVER
================================ */

app.listen(PORT, () => {
  console.log(`🚀 BACKEND: Server running on port ${PORT}`);
});