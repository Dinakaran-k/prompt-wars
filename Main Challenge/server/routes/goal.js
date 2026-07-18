const express = require('express');
const { upsertGoal, getGoal } = require('../controllers/goalController');

const router = express.Router();

router.post('/', upsertGoal);
router.get('/', getGoal);

module.exports = router;
