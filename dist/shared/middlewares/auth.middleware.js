"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../errors/AppError");
const http_status_codes_1 = require("http-status-codes");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
        const token = req.cookies?.accessToken ||
            (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
        if (!token) {
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized!');
        }
        // 2. Token Verify
        let verifiedUser;
        try {
            verifiedUser = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        }
        catch {
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid or expired access token!');
        }
        req.user = verifiedUser;
        // 3. Role-based authorization
        if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden access! You do not have permission.');
        }
        next();
    });
};
exports.auth = auth;
