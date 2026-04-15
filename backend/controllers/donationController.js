import Donation from "../models/donation.js";

// @desc Member: Submit new donation
export const createDonation = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    // 🔥 FIX PARA SA 404: Gawing "/" ang lahat ng "\" sa path
    const cleanPath = req.file.path.replace(/\\/g, "/");

    const donation = await Donation.create({
      ...req.body,
      donatorId: req.user._id,
      proofOfPayment: cleanPath, // I-save ang malinis na path
      municipality: req.user.municipality,
      barangay: req.user.barangay,
    });
    res.status(201).json(donation);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Member: Edit own PENDING donation
// @desc Member: Edit own PENDING donation
export const updateMyDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // 🔥 Allow admin OR the owner
    const isOwner = donation.donatorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only pending donations can be edited
    if (donation.status !== 'pending') {
      return res.status(400).json({ message: "Cannot edit a verified donation." });
    }

    const { amount, referenceNumber, category, contactNumber, paymentMethod } = req.body;

    donation.amount = amount || donation.amount;
    donation.referenceNumber = referenceNumber || donation.referenceNumber;
    donation.category = category || donation.category;
    donation.contactNumber = contactNumber || donation.contactNumber;
    donation.paymentMethod = paymentMethod || donation.paymentMethod;

    if (req.file) {
      donation.proofOfPayment = req.file.path;
    }

    await donation.save();
    res.json(donation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin: Get all donations + stats
export const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donatorId', 'name email').sort({ createdAt: -1 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTotal = await Donation.aggregate([
      { $match: { status: 'received', verifiedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalCollection = await Donation.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const categoryTotals = await Donation.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      donations,
      summary: {
        todayTotal: todayTotal[0]?.total || 0,
        totalCollection: totalCollection[0]?.total || 0,
        categoryTotals: categoryTotals || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Member: Get my donations
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donatorId: req.user._id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// @desc Admin: Verify and generate receipt (now uses PATCH)
export const updateDonationStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = status;
    donation.adminNote = adminNote;

    if (status === 'received') {
      donation.verifiedAt = Date.now();
      donation.officialReceiptNo = `MC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await donation.save();
    res.status(200).json({ message: "Success", donation });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// @desc Member: Delete if still pending
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Not found" });

    // Only owner (member) can delete, and only if pending
    if (donation.donatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: "Cannot delete verified donations." });
    }

    await donation.deleteOne();
    res.json({ message: "Donation record removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};