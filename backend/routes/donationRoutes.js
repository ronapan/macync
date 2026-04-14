import express from "express";
import multer from "multer";
import { 
  createDonation, 
  getMyDonations, 
  getAdminDonations, 
  updateDonationStatus,
  updateMyDonation, // 🔥 NEW: for member edits
  deleteDonation 
} from "../controllers/donationController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/donations/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 1. Member: get own donations
router.get("/my", protect, getMyDonations);

// 2. Admin stats
router.get("/stats", protect, authorizeRoles('admin'), getAdminDonations);

// 3. Main endpoints
router.route("/")
  .post(protect, upload.single('proofOfPayment'), createDonation)
  .get(protect, authorizeRoles('admin'), getAdminDonations);

// 4. Specific donation actions
router.route("/:id")
  .put(protect, upload.single('proofOfPayment'), updateMyDonation)        // 🔥 Member edits
  .patch(protect, authorizeRoles('admin'), updateDonationStatus)          // 🔥 Admin verifies (PATCH)
  .delete(protect, deleteDonation);

export default router;