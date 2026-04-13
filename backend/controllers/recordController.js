import EnvironmentalRecord from "../models/EnvironmentalRecord.js";
import { categories } from "../utils/categories.js";

// @desc    Create new environmental record
// @route   POST /api/v1/records
export const createRecord = async (req, res) => {
  try {
    const { title, municipality, barangay, mainCategory, subCategory, date, contactNumber } = req.body;

    // 1. SMART STATUS LOGIC:
    // Kung Officer ang nag-report, 'approved_brgy' agad para makita agad ng Municipal.
    let initialStatus = 'pending';
    if (req.user.role === 'barangay_officer') {
      initialStatus = 'approved_brgy'; 
    }

    // 2. Basic Validation
    if (!title || !municipality || !barangay || !mainCategory || !subCategory || !date) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // 3. File Check
    if (!req.files || !req.files.resolutionLetter) {
      return res.status(400).json({ message: "Resolution letter is required" });
    }

    const resolutionLetterPath = req.files.resolutionLetter[0].path;
    const imagePath = req.files.images ? req.files.images[0].path : "";

    // 4. Create Record matching the Schema
    const record = await EnvironmentalRecord.create({
      title,
      municipality,
      barangay,
      mainCategory,
      subCategory,
      date,
      reporter: {
        name: req.user.name,
        contactNumber: contactNumber || "Not provided",
        email: req.user.email
      },
      status: initialStatus,
      resolutionLetter: resolutionLetterPath,
      image: imagePath,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Record created successfully", record });

  } catch (error) {
    console.error("CREATE ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get reports filtered by user scope (Barangay vs Municipal)
// @route   GET /api/v1/records
export const getRecords = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "barangay_officer") {
      filter = { municipality: req.user.municipality, barangay: req.user.barangay };
    } else if (req.user.role === "municipal_officer") {
      filter = { municipality: req.user.municipality };
    } 
    // KAPAG ADMIN: Walang 'else if' or 'filter', kaya {} (all) ang makukuha niya.

    const records = await EnvironmentalRecord.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// @desc    Update status with mandatory notes (FIXED 500 ERROR)
// @desc    Update status for Brgy/Muni Officers
// @route   PUT /api/v1/records/:id/status
// backend/controllers/recordController.js

export const updateRecordStatus = async (req, res) => {
  try {
    const { status, comment, urgencyLevel } = req.body; // Pick up urgencyLevel here

    // 1. Basic validation
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ message: "Mandatory note is required (min 5 chars)." });
    }

    const record = await EnvironmentalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Report not found" });

    // 2. Save Urgency Level (Update only if provided by Brgy Officer)
    if (urgencyLevel) {
      record.urgencyLevel = urgencyLevel;
    }
    

    // 3. Update Status and History
    record.status = status;
    record.reviewNotes.push({
      status,
      comment,
      updatedBy: req.user._id,
      date: new Date()
    });

    await record.save();
    res.status(200).json({ message: "Action saved with Urgency Level", record });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// @desc    Get single environmental record by ID
export const getRecordById = async (req, res) => {
  try {
    const record = await EnvironmentalRecord.findById(req.params.id)
      .populate("reviewNotes.updatedBy", "name email role")
      .populate("createdBy", "name email");

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all environmental records of the logged-in user
export const getMyRecords = async (req, res) => {
  try {
    const records = await EnvironmentalRecord.find({ createdBy: req.user._id })
      .populate("reviewNotes.updatedBy", "name role email")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a report
// @route   DELETE /api/v1/records/:id
export const deleteRecord = async (req, res) => {
  try {
    const record = await EnvironmentalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // SECURITY CHECK:
    // 1. Kung Member, dapat siya ang gumawa at dapat 'pending' pa.
    // 2. Kung Admin, pwedeng burahin kahit ano.
    if (req.user.role !== 'admin' && record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this." });
    }

    if (req.user.role !== 'admin' && record.status !== 'pending') {
      return res.status(400).json({ message: "Cannot delete report that is already under review." });
    }
    

    await record.deleteOne();
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a report (Member only)
// @route   PUT /api/v1/records/:id
export const updateRecord = async (req, res) => {
  try {
    const record = await EnvironmentalRecord.findById(req.params.id);

    if (!record) return res.status(404).json({ message: "Record not found" });

    // 1. Security Check: Dapat siya ang may-ari
    if (record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this." });
    }

    // 2. Status Check: Bawal i-edit kung hindi na 'pending'
    if (record.status !== 'pending') {
      return res.status(400).json({ message: "Reports under review cannot be edited." });
    }

    // 3. Update fields
    record.title = req.body.title || record.title;
    record.contactNumber = req.body.contactNumber || record.contactNumber;
    record.mainCategory = req.body.mainCategory || record.mainCategory;
    record.subCategory = req.body.subCategory || record.subCategory;

    // Handle files if new ones are uploaded
    if (req.files?.resolutionLetter) record.resolutionLetter = req.files.resolutionLetter[0].path;
    if (req.files?.images) record.image = req.files.images[0].path;

    await record.save();
    res.status(200).json({ message: "Report updated successfully", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  updateRecordStatus,
  getMyRecords
};