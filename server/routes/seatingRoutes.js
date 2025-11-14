const express = require('express');
const router = express.Router();

const {
  generateSeatingPlan,
  getSeatingPlans,
  downloadSeatingPlanPDF
} = require('../controllers/seatingController');

// Export a function that takes 'upload'
module.exports = (upload) => {
  // Apply 'upload.single()' middleware ONLY to the generation route
  router.post('/generate-seating', upload.single('studentFile'), generateSeatingPlan);

  // Other routes are unchanged
  router.get('/seating-plans', getSeatingPlans);
  router.get('/seating-plan-pdf/:planId', downloadSeatingPlanPDF);

  return router;
};