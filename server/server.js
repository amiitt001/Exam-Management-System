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
  res.json({
    status: 'server-online',
    message: 'Exam Management System API',
    v: '1.0.1',
    ts: '2026-02-23T13:40:00Z'
  });
});

// Use the routes
const apiRouter = express.Router();
apiRouter.use(paperRoutes);
apiRouter.use(seatingRoutes(upload));
app.use('/api', apiRouter);

// Lightweight health check for uptime and container diagnostics
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Catch-all diagnostic 404 for debugging
app.use((req, res) => {
  console.log(`[ROUTE-NOT-FOUND-DEBUG] ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
    debug: "Check server logs for [ROUTE-NOT-FOUND-DEBUG]"
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});