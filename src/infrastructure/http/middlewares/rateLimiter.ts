import rateLimit from "express-rate-limit";
import { config } from "@config/env";

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(
      res,
      "RATE_LIMIT_EXCEEDED",
      "Too many requests, please try again later",
      429
    );
  },
});
