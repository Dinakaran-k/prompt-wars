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

// Sessions are identified by an X-Session-Id header, which functions like a
// bearer token (unlike a cookie, it has no SameSite/HttpOnly protection) —
// a permissive CORS policy would let any origin that obtains a leaked
// session ID (shared URL, referrer, etc.) read that session's data
// cross-origin. Keep a real origin allowlist. Scoped to /api only (one
// mount below, not per-route) so it can never touch static asset or page
// requests — that was the actual cause of the earlier production outage,
// not the existence of an allowlist.
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // same-origin / non-browser requests send no Origin header
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Id']
};

app.use(express.json({ limit: '10kb' }));

app.use('/api', cors(corsOptions));
app.use('/api/goal', requireSession, goalRouter);
app.use('/api/checkins', requireSession, checkinsRouter);
app.use('/api/stats', requireSession, statsRouter);

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
