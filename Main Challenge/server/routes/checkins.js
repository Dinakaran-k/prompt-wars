const express = require('express');
const { createCheckIn, listCheckIns } = require('../controllers/checkinsController');
const { checkInLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', checkInLimiter, createCheckIn);
router.get('/', listCheckIns);

module.exports = router;
