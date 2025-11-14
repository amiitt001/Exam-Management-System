const SeatingPlan = require("../models/SeatingPlan");
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

// Define the URL for your Python service
const PYTHON_SERVICE_URL = 'http://localhost:8081'; 

/**
 * @route   POST /api/generate-seating
 * @desc    Receives file, forwards to Python, saves resulting JSON
 */
exports.generateSeatingPlan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No student file uploaded." });
    }

    // 1. Create new FormData to send to Python
    const form = new FormData();
    form.append('studentFile', req.file.buffer, req.file.originalname);
    form.append('roomList', req.body.roomList); // Pass the roomList string

    // 2. Call the Python '/process-file' endpoint
    const response = await axios.post(`${PYTHON_SERVICE_URL}/process-file`, form, {
      headers: form.getHeaders(),
    });

    // 3. Get the JSON plan back from Python
    const { planData, studentCount, roomList } = response.data;
    
    // 4. Save this plan to our MongoDB
    const newPlan = await SeatingPlan.create({
      planData: planData,
      studentCount: studentCount,
      roomList: roomList, // This was the parsed room list
      planName: `Plan - ${new Date().toLocaleString()}`
    });

    // 5. Respond to the React client
    res.status(201).json({ success: true, message: "Plan created!", plan: newPlan });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Error generating plan", error: error.message });
  }
};

/**
 * @route   GET /api/seating-plan-pdf/:planId
 * @desc    Fetches plan JSON from DB, forwards to Python to get PDF
 */
exports.downloadSeatingPlanPDF = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 1. Call the Python '/generate-pdf' endpoint
    // We only need to send 'planData'. The room layout info
    // is already stored inside it from the 'generate' step.
    const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-pdf`, {
      planData: plan.planData 
    }, {
      responseType: 'stream' // We expect a PDF stream back
    });

    // 2. Stream the PDF from the Python service directly to the user
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Seating_Plan_${plan._id}.pdf`);
    response.data.pipe(res);

  } catch (error)
 {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

/**
 * @route   GET /api/seating-plans
 * @desc    Fetches all saved seating plans (No change)
 */
exports.getSeatingPlans = async (req, res) => {
  try {
    const plans = await SeatingPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
     res.status(500).json({ message: "Error fetching plans", error: error.message });
  }
};