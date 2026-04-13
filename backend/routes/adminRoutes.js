import express from "express";
import { 
  getAdminAnalytics, 
  getAllMembers, 
  getDrillDownStats, // Idagdag ito
  deleteUser,      
     // Idagdag ito
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Lahat ng routes dito ay dapat 'admin' lang ang may access
router.use(protect, authorizeRoles("admin"));

router.get("/analytics", getAdminAnalytics);
router.get("/members", getAllMembers);

// 1. Route para sa interactive drill-down details
router.get("/drill", getDrillDownStats);

// 2. Route para sa pag-delete ng user (CRUD Requirement)
router.delete("/users/:id", deleteUser);

// backend/routes/adminRoutes.js
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;