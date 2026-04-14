import mongoose from "mongoose"; 

const donationSchema = mongoose.Schema({
  donatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['GCash', 'Bank Transfer'], required: true },
  referenceNumber: { type: String, required: true, minlength: 10, maxlength: 20 },
  proofOfPayment: { type: String },
  category: { 
    type: String, 
    enum: ['Environmental Monitoring', 'Disaster Relief', 'Advocacy Programs', 'Community Development'],
    required: true 
  },
  comment: { type: String },
  municipality: { type: String, required: true },
  barangay: { type: String, required: true },
  status: { type: String, enum: ['pending', 'received', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  verifiedAt: { type: Date },
  officialReceiptNo: { type: String }
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema); 
export default Donation;                                    