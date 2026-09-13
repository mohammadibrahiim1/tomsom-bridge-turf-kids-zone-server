"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRateLimiter = exports.authRateLimiter = exports.otpRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 1. Strict Limiter for OTP & Password Reset
exports.otpRateLimiter = (0, express_rate_limit_1.default)({
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
exports.authRateLimiter = (0, express_rate_limit_1.default)({
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
exports.adminRateLimiter = (0, express_rate_limit_1.default)({
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
