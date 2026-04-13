import express from "express";
import multer from "multer";
import { 
  createDonation, 
  getMyDonations, 
  getAdminDonations, 
  updateDonationStatus, 
  deleteDonation 
} from "../controllers/donationController.js";

// 🔥 ANG FIX: I-import ang protect at authorizeRoles middleware
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/donations/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Get my own donations (Para sa Members)
router.get("/my", protect, getMyDonations);

// 2. Main donation endpoints
router.route("/")
  .post(protect, upload.single('proofOfPayment'), createDonation) // Member submits
  .get(protect, authorizeRoles('admin'), getAdminDonations);      // Admin views all

// 3. Admin Stats for drill-down cards
router.get("/stats", protect, authorizeRoles('admin'), getAdminDonations);

// 4. Specific donation actions
router.route("/:id")
  .put(protect, authorizeRoles('admin'), updateDonationStatus)   // Admin verifies
  .delete(protect, deleteDonation);                              // Member deletes if pending

export default router;