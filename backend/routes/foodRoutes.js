const express = require('express');
const router = express.Router();
const {
  createFood,
  getRestaurantFoods,
  getAvailableFoods,
  claimFood,
  getVolunteerAssignments,
  deleteFood
} = require('../controllers/foodController');

// Create new food donation
router.post('/donate', createFood);

// Get restaurant's food donations
router.get('/my-donations', getRestaurantFoods);

// Get volunteer's assigned donations
router.get('/my-assignments', getVolunteerAssignments);

// Get all available food donations
router.get('/available', getAvailableFoods);

// Claim a food donation
router.patch('/claim/:foodId', claimFood);

// Delete a food donation
router.delete('/:foodId', deleteFood);

module.exports = router;
