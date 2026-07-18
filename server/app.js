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

app.set('trust proxy', 1);
app.use(helmet());

// Sessions are identified by an X-Session-Id header, which functions like a
// bearer token (unlike a cookie, it has no SameSite/HttpOnly protection) —
// a permissive CORS policy would let any origin that obtains a leaked
// session ID (shared URL, referrer, etc.) read that session's data
// cross-origin. Keep a real origin allowlist. Scoped to /api only (one
// mount below, not per-route) so it can never touch static asset or page
// requests — that was the actual cause of an earlier production outage,
// not the existence of an allowlist.
//
// This is a single combined deploy (Express serves the built client itself),
// so the only legitimate origin is whatever host this request actually
// arrived on. We use a robust host-comparison logic to allow requests
// matching the server's own host or an explicit CORS_ORIGIN setting,
// resolving CORS blocks that can occur due to reverse proxy protocol
// differences (HTTP vs HTTPS).
function corsOptionsDelegate(req, callback) {
  const origin = req.headers.origin;

  let isAllowed = false;
  if (!origin) {
    // Same-origin or non-browser requests (which don't send Origin header) are allowed
    isAllowed = true;
  } else {
    try {
      const originUrl = new URL(origin);
      const hostHeader = req.get('host'); // e.g. "unplug-etso.onrender.com" or "localhost:5002"
      const originHost = originUrl.host; // e.g. "unplug-etso.onrender.com" or "localhost:5174"

      // 1. Same-host requests are always allowed (ignoring protocol for proxy setups)
      if (originHost === hostHeader) {
        isAllowed = true;
      }
      // 2. Explicit CORS_ORIGIN check (matching host component and ignoring trailing slashes/protocols)
      else if (process.env.CORS_ORIGIN) {
        const allowedClean = process.env.CORS_ORIGIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (originHost === allowedClean) {
          isAllowed = true;
        }
      }
      // 3. Localhost development fallback
      else if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        isAllowed = true;
      }
    } catch (e) {
      isAllowed = false;
    }
  }

  if (!isAllowed) {
    return callback(new Error('Not allowed by CORS'));
  }

  callback(null, {
    origin: true,
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Session-Id']
  });
}

app.use(express.json({ limit: '10kb' }));

app.use('/api', cors(corsOptionsDelegate));
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
