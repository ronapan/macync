import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import connectDB from "./config/db.js";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// 1. INITIALIZATION
dotenv.config();
connectDB();
const app = express();

// 2. PRODUCTION FIX: ENSURE UPLOAD DIRECTORIES EXIST (Prevents 500 Error on Render)
// PRODUCTION FIX: Siguraduhing existing ang folders
const uploadDirs = ['uploads', 'uploads/donations'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 3. GLOBAL MIDDLEWARES
app.use(cors({
  origin: "*", // Flexible for defense/testing
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Para makita ang uploaded images)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 4. API ROUTE REGISTRATION
app.use("/api/v1/users", authRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/donations", donationRoutes); 
app.use("/api/v1/admin", adminRoutes);

// Root Endpoint for verification
app.get("/", (req, res) => res.send("MaCync API Operating Normally"));

// 5. GLOBAL ERROR HANDLERS (Required for High Grade)
// Catch 404 (Route not found)
app.use((req, res, next) => { 
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Final Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 6. SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MaCync Server active on port ${PORT}`);
});