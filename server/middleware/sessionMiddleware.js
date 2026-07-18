const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireSession(req, res, next) {
  const sessionId = req.header('X-Session-Id');

  if (!sessionId || !UUID_RE.test(sessionId)) {
    return res.status(400).json({ error: 'Missing or invalid X-Session-Id header' });
  }

  req.sessionId = sessionId;
  next();
}

module.exports = { requireSession };
