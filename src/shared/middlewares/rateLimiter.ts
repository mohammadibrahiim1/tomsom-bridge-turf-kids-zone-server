import rateLimit from 'express-rate-limit';

// 1. Strict Limiter for OTP & Password Reset
export const otpRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // ১ মিনিট
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many OTP attempts. Please wait 1 minute before requesting again.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

export const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many admin operations executed. Please slow down.',
  },
});
