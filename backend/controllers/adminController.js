import User from "../models/User.js";
import EnvironmentalRecord from "../models/EnvironmentalRecord.js";

// backend/controllers/adminController.js

export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Bilangin lahat maliban sa admin para sa Membership Registry badge
    const totalRegistry = await User.countDocuments({ role: { $ne: "admin" } });
    
    // Opsyonal: Breakdown para sa analytics
    const totalMembers = await User.countDocuments({ role: "member" });
    const totalMuniOfficers = await User.countDocuments({ role: "municipal_officer" });
    const totalBrgyOfficers = await User.countDocuments({ role: "barangay_officer" });

    const stats = {
      totalRegistry, // Ito ang dapat maging "3" (1+1+1)
      totalMembers,
      totalMuniOfficers,
      totalBrgyOfficers,
      totalReports: await EnvironmentalRecord.countDocuments(),
      pendingCount: await EnvironmentalRecord.countDocuments({ status: "pending" }),
    };

    // 2. Member/Officer distribution per location (Para sa drill-down badges)
    const userStats = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      {
        $group: {
          _id: { municipality: "$municipality", barangay: "$barangay" },
          total: { $sum: 1 }
        }
      }
    ]);

    const reportingStats = await EnvironmentalRecord.aggregate([
      { $group: { _id: { municipality: "$municipality", barangay: "$barangay" }, total: { $sum: 1 } } }
    ]);

    const urgencyStats = await EnvironmentalRecord.aggregate([
      { $group: { _id: "$urgencyLevel", count: { $sum: 1 } } }
    ]);

    res.json({ stats, userStats, reportingStats, urgencyStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Get members filtered by municipality
export const getAllMembers = async (req, res) => {
  try {
    const { municipality } = req.query;
    let filter = { role: "member" };
    
    if (municipality) {
      filter.municipality = municipality;
    }

    const members = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Get Detailed Stats for Drill-down
export const getDrillDownStats = async (req, res) => {
  try {
    const { type, municipality, barangay, urgencyLevel } = req.query;
    let query = {};
    if (municipality) query.municipality = municipality;
    if (barangay) query.barangay = barangay;
    if (urgencyLevel) query.urgencyLevel = urgencyLevel;

    if (type === 'members') {
      query.role = { $ne: 'admin' }; // Ipakita lahat maliban sa admin
      const data = await User.find(query).select("-password").sort({ name: 1 });
      return res.json(data);
    } 

    // 🔥 POPULATE is the key para makita ang Reporter Details
    const data = await EnvironmentalRecord.find(query)
      .populate("createdBy", "name email municipality barangay role")
      .sort({ createdAt: -1 });
    
    res.json(data);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// backend/controllers/adminController.js

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    // Protection: Huwag payagan ang admin na i-delete ang sarili niya
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    await user.deleteOne();
    res.json({ message: "User account permanently removed from MaCync." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};