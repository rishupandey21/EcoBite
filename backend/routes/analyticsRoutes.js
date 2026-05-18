const express = require("express");
const router = express.Router();

const {
  getRestaurantAnalytics,
  getNgoAnalytics,
  getAdminAnalytics,
} = require("../controllers/analyticsController");

const {
  protect,
  authorizeRoles,
  requireVerified,
} = require("../middleware/authMiddleware");

router.get(
  "/restaurant",
  protect,
  authorizeRoles("restaurant"),
  requireVerified,
  getRestaurantAnalytics
);

router.get(
  "/ngo",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  getNgoAnalytics
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAdminAnalytics
);

module.exports = router;