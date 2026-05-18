const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  verifyUser,
  suspendUser,
  reactivateUser,
  getAllFoods,
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// All admin routes are protected
router.use(protect);
router.use(authorizeRoles("admin"));

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/verify", verifyUser);
router.patch("/users/:userId/suspend", suspendUser);
router.patch("/users/:userId/reactivate", reactivateUser);

// Food monitoring
router.get("/foods", getAllFoods);

module.exports = router;