export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user was attached by the 'protect' middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    next();
  };
};