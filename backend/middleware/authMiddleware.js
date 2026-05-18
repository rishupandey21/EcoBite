const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check if user is logged in
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token format: Bearer token_here
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token id
    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Block suspended user
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account is suspended",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      message: "Not authorized, token invalid",
    });
  }
};

// Allow only selected roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.account_type)) {
      return res.status(403).json({
        message: "You are not allowed to access this route",
      });
    }

    next();
  };
};

// Allow only verified users
exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: "Your account is not verified yet",
    });
  }

  next();
};