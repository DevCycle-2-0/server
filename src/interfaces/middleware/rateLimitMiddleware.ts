import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000"),
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts",
    },
  },
});
