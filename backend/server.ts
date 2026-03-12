import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* Fix __dirname for ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

/* API routes */
app.use("/api/auth", authRoutes);

/* MongoDB */
mongoose.connect(process.env.MONGODB_URI as string)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* Serve frontend */
const frontendPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});