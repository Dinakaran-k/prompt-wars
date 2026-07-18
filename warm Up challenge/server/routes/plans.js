const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');

router.post('/', plansController.createPlan);
router.get('/', plansController.getAllPlans);
router.get('/:id', plansController.getPlanById);
router.delete('/:id', plansController.deletePlan);

module.exports = router;
