const express = require("express");
const router = express.Router();

const {
  createRequest,
  getRestaurantRequests,
  getNgoRequests,
  acceptRequest,
  assignVolunteer,
  markPickedUp,
  markDelivered,
  cancelRequest,
} = require("../controllers/requestController");

const {
  protect,
  authorizeRoles,
  requireVerified,
} = require("../middleware/authMiddleware");

// NGO creates request for a specific food
router.post(
  "/",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  createRequest
);

// Restaurant views requests sent to them
router.get(
  "/restaurant",
  protect,
  authorizeRoles("restaurant"),
  getRestaurantRequests
);

// NGO views their own requests
router.get(
  "/ngo",
  protect,
  authorizeRoles("ngo"),
  getNgoRequests
);

// Restaurant accepts a request
router.patch(
  "/:requestId/accept",
  protect,
  authorizeRoles("restaurant"),
  acceptRequest
);

// NGO assigns volunteer after restaurant accepts request
router.patch(
  "/:requestId/assign-volunteer",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  assignVolunteer
);

// Volunteer marks pickup as picked up
router.patch(
  "/:requestId/picked-up",
  protect,
  authorizeRoles("volunteer"),
  requireVerified,
  markPickedUp
);

// Volunteer marks pickup as delivered
router.patch(
  "/:requestId/delivered",
  protect,
  authorizeRoles("volunteer"),
  requireVerified,
  markDelivered
);

// NGO cancels request
router.patch(
  "/:requestId/cancel",
  protect,
  authorizeRoles("ngo"),
  requireVerified,
  cancelRequest
);

module.exports = router;