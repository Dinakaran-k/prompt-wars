const rateLimit = require('express-rate-limit');

const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.sessionId || req.ip,
  message: { error: 'Too many check-ins submitted. Please wait a few minutes and try again.' }
});

module.exports = { checkInLimiter };
