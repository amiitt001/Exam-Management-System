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
  origin: (origin, callback) => {
    // Allow if no origin (like mobile apps or curl) or if it's from vercel or localhost
    if (!origin || /vercel\.app$/.test(origin) || /localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Root route for sanity check
app.get('/', (req, res) => {
  res.json({ status: 'server-online', message: 'Exam Management System API' });
});

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