import express from "express";
import multer from "multer";
import { 
  createRecord, getRecords, getRecordById, 
  updateRecordStatus, updateRecord, deleteRecord, getMyRecords 
} from "../controllers/recordController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Base endpoints
router.route("/")
  .get(protect, getRecords)
  .post(protect, upload.fields([{ name: "resolutionLetter", maxCount: 1 }, { name: "images", maxCount: 5 }]), createRecord);

// User-specific history
router.get("/my-reports", protect, getMyRecords);

// ID-specific operations (Read, Update, Delete)
router.route("/:id")
  .get(protect, getRecordById)
  .put(protect, upload.fields([{ name: "resolutionLetter", maxCount: 1 }, { name: "images", maxCount: 5 }]), updateRecord)
  .delete(protect, deleteRecord);

// Administrative status updates
router.put("/:id/status", protect, authorizeRoles("admin", "barangay_officer", "municipal_officer"), updateRecordStatus);

export default router;