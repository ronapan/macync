import User from "../models/User.js";
import EnvironmentalRecord from "../models/EnvironmentalRecord.js";

// backend/controllers/adminController.js

// backend/controllers/adminController.js

export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Bilangin lahat maliban sa admin para sa Membership Registry badge
    const totalRegistry = await User.countDocuments({ role: { $ne: "admin" } });
    
    // 2. Kabuuang bilang ng lahat ng reports (para sa top badge)
    const totalReports = await EnvironmentalRecord.countDocuments();

    const stats = {
      totalRegistry: totalRegistry, 
      totalReports: totalReports,
      pendingCount: await EnvironmentalRecord.countDocuments({ status: "pending" }),
      resolvedCount: await EnvironmentalRecord.countDocuments({ status: { $regex: /resolved/i } }),
    };

    // 3. User distribution per location (Para sa Membership Tab)
    const userStats = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      {
        $group: {
          _id: { municipality: "$municipality", barangay: "$barangay" },
          total: { $sum: 1 }
        }
      }
    ]);

    // 4. 🔥 THE FIX: Reporting Stats grouped by Muni, Brgy, AND UrgencyLevel
    // Kailangan ang urgencyLevel sa loob ng _id para gumana ang drill-down badges
    const reportingStats = await EnvironmentalRecord.aggregate([
      {
        $group: {
          _id: { 
            municipality: "$municipality", 
            barangay: "$barangay",
            urgencyLevel: "$urgencyLevel" // Isinama ito para ma-filter ng frontend
          },
          total: { $sum: 1 }
        }
      }
    ]);

    // 5. Urgency breakdown (Para sa 4 na malalaking cards sa Urgency Tab)
    const urgencyStats = await EnvironmentalRecord.aggregate([
      { 
        $group: { 
          _id: "$urgencyLevel", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // I-send ang kumpletong data sa frontend
    res.json({ stats, userStats, reportingStats, urgencyStats });
    
  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ message: "Internal Server Error during analytics generation." });
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