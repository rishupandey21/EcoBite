const express = require("express");
const router = express.Router();

const {
  createFood,
  getRestaurantFoods,
  getAvailableFoods,
  claimFood,
  getVolunteerAssignments,
  deleteFood,
} = require("../controllers/foodController");

const {
  protect,
  authorizeRoles,
  requireVerified,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// Restaurant creates new food donation with optional image
router.post(
  "/donate",
  protect,
  authorizeRoles("restaurant"),
  requireVerified,
  upload.single("image"),
  createFood
);

// Restaurant gets own food donations
router.get(
  "/my-donations",
  protect,
  authorizeRoles("restaurant"),
  getRestaurantFoods
);

// Volunteer gets assigned donations
router.get(
  "/my-assignments",
  protect,
  authorizeRoles("volunteer"),
  requireVerified,
  getVolunteerAssignments
);

// NGO gets all available food donations
router.get(
  "/available",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  getAvailableFoods
);

// NGO requests food temporarily
router.patch(
  "/claim/:foodId",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  claimFood
);

// Restaurant deletes own food donation
router.delete(
  "/:foodId",
  protect,
  authorizeRoles("restaurant"),
  deleteFood
);

module.exports = router;