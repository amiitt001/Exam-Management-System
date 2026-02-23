const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Using Firestore; MongoDB removed
const multer = require('multer'); // <-- Make sure multer is required

// Import your routes
const paperRoutes = require('./routes/paperRoutes');
const seatingRoutes = require('./routes/seatingRoutes'); // This is now a function

const app = express();
const port = process.env.PORT || 5000;

console.log("✅ Using Firestore as datastore");

// --- Multer Configuration ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors({
  origin: [
    'https://exam-management-system-one.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Use the routes
app.use('/api', paperRoutes);
app.use('/api', seatingRoutes(upload)); // <-- Pass 'upload' here

// Lightweight health check for uptime and container diagnostics
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});