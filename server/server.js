const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require("mongoose");
const multer = require('multer');

// Import your routes
const paperRoutes = require('./routes/paperRoutes');
const seatingRoutes = require('./routes/seatingRoutes');
// ... other routes

const app = express();
const port = 5000;

// Connect to DB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/exam-generator';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB error:", err));

  const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Middleware
app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api', paperRoutes); 
app.use('/api', seatingRoutes(upload));
// ...

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
