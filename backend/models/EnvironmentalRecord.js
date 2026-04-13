import mongoose from "mongoose";
import { categories } from "../utils/categories.js";

/**
 * Schema for environmental incident reports.
 * Implements Referencing (createdBy) to the User model.
 */
const recordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    municipality: { type: String, required: true },
    barangay: { type: String, required: true },
    mainCategory: { type: String, required: true, enum: Object.keys(categories) },
    subCategory: { type: String, required: true },
    date: { type: Date, required: true },
    reporter: {
      name: { type: String, required: true },
      contactNumber: { type: String, required: true },
      email: { type: String }
    },
    image: { type: String },
    resolutionLetter: { type: String },
    urgencyLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    status: {
      type: String,
      enum: ["pending", "under_review", "rejected_brgy", "resolved_brgy", "escalated", "rejected_municipal", "resolved_municipal"],
      default: "pending"
    },
    reviewNotes: [{
      status: String,
      comment: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("EnvironmentalRecord", recordSchema);