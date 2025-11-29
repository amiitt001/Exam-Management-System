const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require("mongoose");
const multer = require('multer'); // <-- Make sure multer is required

// Import your routes
const paperRoutes = require('./routes/paperRoutes');
const seatingRoutes = require('./routes/seatingRoutes'); // This is now a function

const app = express();
const port = process.env.PORT || 5000;

// Connect to DB
mongoose.connect(process.env.MONGO_URI || "...")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB error:", err));

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api', paperRoutes);
app.use('/api', seatingRoutes(upload)); // <-- Pass 'upload' here

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});