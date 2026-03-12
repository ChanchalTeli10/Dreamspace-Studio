import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dreamspace";

app.use(cors());
app.use(express.json());

/* ===== API ROUTES FIRST ===== */
app.use("/api/auth", authRoutes);

/* ===== CONNECT DATABASE ===== */
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ===== SERVE REACT BUILD ===== */
const __dirname1 = path.resolve();

/* Serve React build */
app.use(express.static(path.join(process.cwd(), "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "frontend/dist/index.html"));
});
/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});