const express = require('express');
const router = express.Router();

const {
  createRequest,
  getRestaurantRequests,
  getNgoRequests,
  acceptRequest
} = require('../controllers/requestController');

// NGO creates request for a specific foodId
router.post('/', createRequest);

// Restaurant views requests sent to them
router.get('/restaurant', getRestaurantRequests);

// NGO views their own requests (to show accepted/pending)
router.get('/ngo', getNgoRequests);

// Restaurant accepts a request
router.patch('/:requestId/accept', acceptRequest);

module.exports = router;

