import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes via JWT verification.
 * Attaches the authenticated user object to the request.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Access Denied: Invalid or expired token" });
    }
  }

  return res.status(401).json({ message: "Access Denied: No authentication token provided" });
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Filters access based on the 'role' field in the User model.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Role (${req.user.role}) is unauthorized for this action` 
      });
    }
    next();
  };
};