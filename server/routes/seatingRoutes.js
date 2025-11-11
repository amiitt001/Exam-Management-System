const express = require('express');
const router = express.Router();

// 1. Import the controller functions
const {
  generateSeatingPlan,
  getSeatingPlans,
  downloadSeatingPlanPDF
} = require('../controllers/seatingController');

// 2. Define the routes
// POST /api/generate-seating
router.post('/generate-seating', generateSeatingPlan);

// GET /api/seating-plans
router.get('/seating-plans', getSeatingPlans);

// GET /api/seating-plan-pdf/:planId
router.get('/seating-plan-pdf/:planId', downloadSeatingPlanPDF);

// 3. Export the router
module.exports = router;