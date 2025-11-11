const express = require('express');
const router = express.Router();

// 1. Import the controller functions
const {
  generatePaper,
  downloadPaperPDF,
  getPapers
} = require('../controllers/paperController');

// 2. Define the routes
// POST /api/generate-paper
router.post('/generate-paper', generatePaper);

// POST /api/generate-paper-pdf
router.post('/generate-paper-pdf', downloadPaperPDF);

// GET /api/papers
router.get('/papers', getPapers);

// (Add your mock routes here too)
// router.post('/generate-paper-mock', generatePaperMock);


// 3. Export the router
module.exports = router;