import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, // 1. Added this import
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private Routes
// 2. Used .route() to handle both GET (view) and PUT (update) in one place
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);



export default router;