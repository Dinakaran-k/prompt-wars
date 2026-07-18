require('dotenv').config();
const express = require('express');
const cors = require('cors');
const plansRouter = require('./routes/plans');

const app = express();

// Configure CORS explicitly
const corsOptions = {
  origin: function (origin, callback) {
    // If no origin is provided (e.g. from local server tests or server-to-server calls), allow it
    if (!origin) return callback(null, true);

    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    
    // In production, we strictly match. In dev, we can allow localhost
    if (process.env.NODE_ENV === 'production') {
      if (origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow localhost or development client
      if (origin.startsWith('http://localhost') || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // security: limit request body sizes

// Map route endpoints to support both /plans and /api/plans
app.use('/api/plans', plansRouter);
app.use('/plans', plansRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON request body' });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  return res.status(500).json({ error: 'An unexpected server error occurred' });
});

// Start the server if this file is run directly (not loaded by Jest/supertest)
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Cooking Companion server running on port ${PORT}`);
  });
}

module.exports = app;
