const express = require('express');
const router = express.Router();

const { getVolunteers } = require('../controllers/userController');

router.get('/volunteers', getVolunteers);

module.exports = router;

