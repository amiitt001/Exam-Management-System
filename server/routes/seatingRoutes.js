const express = require('express');
const router = express.Router();

// --- We only need the 'convertPlanToPDF' function ---
const {
  convertPlanToPDF 
} = require('../controllers/seatingController');

module.exports = (upload) => {
  // --- The main route for uploading and converting the file ---
  router.post('/convert-to-pdf', upload.single('seatingPlanFile'), convertPlanToPDF);
  
  return router;
};