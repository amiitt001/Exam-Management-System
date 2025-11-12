const express = require('express');
const router = express.Router();

// 1. Import the controller functions
const {
  generateSeatingPlan,
  getSeatingPlans,
  downloadSeatingPlanPDF
} = require('../controllers/seatingController');

module.exports = (upload) => {
  // Use 'upload.single("studentFile")' to tell this route
  // to expect one file named "studentFile"
  router.post('/generate-seating', upload.single('studentFile'), generateSeatingPlan);

  router.get('/seating-plans', getSeatingPlans);
  router.get('/seating-plan-pdf/:planId', downloadSeatingPlanPDF);

  return router;
}