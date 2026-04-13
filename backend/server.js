import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Initialization
dotenv.config();
connectDB();
const app = express();

// Global Middlewares
app.use(cors({
  origin: ["https://macyanc.vercel.app", "http://localhost:5173"], // 
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Route Registration
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/donate", donationRoutes);
app.use("/api/v1/admin", adminRoutes);

// Root Endpoint for verification
app.get("/", (req, res) => res.send("MaCync API Operating Normally"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MaCync Server active on port ${PORT}`));