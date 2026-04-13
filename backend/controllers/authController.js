import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
// Add this to controllers/authController.js
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields only if they are provided in the request
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // IMPORTANT: Keep existing values if not changing
    user.municipality = req.body.municipality || user.municipality;
    user.barangay = req.body.barangay || user.barangay;

    // Handle password update separately if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      municipality: updatedUser.municipality,
      barangay: updatedUser.barangay,
      token: generateToken(updatedUser._id),
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc Register new user
// @route POST /api/v1/users/register
// @access Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, municipality, barangay } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  // ✅ UPDATED ROLES
  const validRoles = ["admin", "municipal_officer", "barangay_officer", "member"];
  const userRole = role && validRoles.includes(role) ? role : "member";

  // ✅ VALIDATIONS
  if (userRole === "municipal_officer" && !municipality) {
    return res.status(400).json({
      message: "Municipality is required for municipal officer",
    });
  }

  if (userRole === "barangay_officer" && (!municipality || !barangay)) {
    return res.status(400).json({
      message: "Municipality and barangay are required for barangay officer",
    });
  }

  // Check existing user
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  //const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: password,
    role: userRole,
    municipality: municipality || undefined,
    barangay: barangay || undefined,
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    municipality: user.municipality,
    barangay: user.barangay,
    token: generateToken(user.id),
  });
};

// @desc Authenticate user & get token
// @route POST /api/v1/users/login
// @access Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email);
  
  const user = await User.findOne({ email });

  if (!user) {
    console.log("❌ Login failed: User not found in database.");
    return res.status(401).json({ message: "Invalid email or password" });
  }

  console.log("User found. Comparing passwords...");
  console.log("Password entered by user:", password);
  console.log("Hashed password in database:", user.password);

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Does Bcrypt match?", isMatch);

  if (isMatch) {
    // ... rest of your role checks and res.json code
    console.log("Login successful for:", user.name);
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      municipality: user.municipality,
      barangay: user.barangay,
      token: generateToken(user.id),
    });
  } else {
    console.log("❌ Login failed: Password does not match.");
    res.status(401).json({ message: "Invalid email or password" });
  }
};

export const getUserProfile = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    municipality: req.user.municipality,
    barangay: req.user.barangay, // ✅ ADD
  });
};