const express = require('express');
const router = express.Router();
const seatingController = require('../controllers/seatingController');

module.exports = (upload) => {
  router.post('/convert-to-pdf', upload.single('seatingPlanFile'), seatingController.convertPlanToPDF);
  router.post('/preview-seating-plan', upload.single('seatingPlanFile'), seatingController.previewSeatingPlan);
  router.post('/generate-pdf-from-data', seatingController.generatePDFFromData);

  return router;
};