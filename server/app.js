require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { requireSession } = require('./middleware/sessionMiddleware');
const goalRouter = require('./routes/goal');
const checkinsRouter = require('./routes/checkins');
const statsRouter = require('./routes/stats');

const app = express();

app.use(helmet());

// CORS only matters for local dev, where the Vite client (localhost:5174)
// and this server (localhost:5002) are different origins. In production
// this is a single combined service — the client is served from this same
// origin — so there's no cross-origin caller to restrict, and sessions are
// identified by an X-Session-Id header (not a cookie), so there's no
// CSRF/credential-leak risk from allowing any origin here. Scoped to /api
// only so it never touches static asset or page requests.
const corsOptions = {
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Id']
};

app.use(express.json({ limit: '10kb' }));

app.use('/api/goal', cors(corsOptions), requireSession, goalRouter);
app.use('/api/checkins', cors(corsOptions), requireSession, checkinsRouter);
app.use('/api/stats', cors(corsOptions), requireSession, statsRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Single combined deployable service: Express serves the built React app
// directly, so there's one deploy target and no cross-origin config needed
// in production. In local dev this is a no-op — the client runs on its own
// Vite dev server and proxies /api here instead (see client/vite.config.js).
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

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

if (require.main === module) {
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Unplug server running on port ${PORT}`);
  });
}

module.exports = app;
