import Donation from "../models/donation.js";

// @desc    Member: Submit new donation
export const createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      proofOfPayment: req.file ? req.file.path : "",
      donatorId: req.user._id,
      municipality: req.user.municipality,
      barangay: req.user.barangay
    });
    res.status(201).json(donation);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

// backend/controllers/donationController.js

export const getAdminDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donatorId', 'name email').sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Math para sa "Received Today"
    const todayTotal = await Donation.aggregate([
      { $match: { status: 'received', verifiedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 2. Math para sa "Total Collection" (Lahat ng 'received')
    const totalCollection = await Donation.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 3. Math para sa "Fund Categories" (Budget per Category)
    const categoryTotals = await Donation.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
      
    ]);

    // Sa loob ng getAdminDonations sa backend/controllers/donationController.js
    const stats = {
      // ... existing stats ...
      categoryTotals: await Donation.aggregate([
        { $match: { status: 'received' } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } }
      ])
    };

    res.status(200).json({
      donations,
      summary: {
        todayTotal: todayTotal[0]?.total || 0,
        totalCollection: totalCollection[0]?.total || 0,
        categoryTotals: categoryTotals || [] // Listahan ng fund budget
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Member: Get my donations
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donatorId: req.user._id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};




// @desc    Admin: Verify and Generate Official Receipt
// backend/controllers/donationController.js

export const updateDonationStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = status;
    donation.adminNote = adminNote;

    if (status === 'received') {
      donation.verifiedAt = Date.now();
      // Generate Official Receipt: MC-[YEAR]-[RANDOM]
      donation.officialReceiptNo = `MC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    await donation.save();
    res.json({ message: "Donation processed and receipt issued.", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Member: Delete if still pending
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Not found" });

    if (donation.status !== 'pending') {
      return res.status(400).json({ message: "Cannot delete verified donations." });
    }

    await donation.deleteOne();
    res.json({ message: "Donation record removed." });
  } catch (error) { res.status(500).json({ message: error.message }); }
};