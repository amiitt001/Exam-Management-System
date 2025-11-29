const express = require('express');
const router = express.Router();

// --- We only need the 'convertPlanToPDF' function ---
const {
  convertPlanToPDF
} = require('../controllers/seatingController');

module.exports = (upload) => {
  // --- The main route for uploading and converting the file ---
  router.post('/convert-to-pdf', upload.single('seatingPlanFile'), convertPlanToPDF);
  router.post('/preview-seating-plan', upload.single('seatingPlanFile'), require('../controllers/seatingController').previewSeatingPlan);
  router.post('/generate-pdf-from-data', require('../controllers/seatingController').generatePDFFromData);

  return router;
};