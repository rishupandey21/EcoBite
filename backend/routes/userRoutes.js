const express = require("express");
const router = express.Router();

const { getVolunteers } = require("../controllers/userController");

const {
  protect,
  authorizeRoles,
  requireVerified,
} = require("../middleware/authMiddleware");

// NGO/Admin can view volunteers list
router.get(
  "/volunteers",
  protect,
  authorizeRoles("ngo", "admin"),
  requireVerified,
  getVolunteers
);

module.exports = router;