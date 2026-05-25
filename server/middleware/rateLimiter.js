import rateLimit from "express-rate-limit";

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });

export const apiLimiter = buildLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
  message: "Too many API requests. Please slow down and try again shortly.",
});

export const authLimiter = buildLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60_000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 20),
  message: "Too many authentication attempts. Please wait before trying again.",
});
