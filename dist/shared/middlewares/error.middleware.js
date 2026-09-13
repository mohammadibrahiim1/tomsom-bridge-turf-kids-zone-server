"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const globalErrorHandler = (err, req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let statusCode = 500;
    let clientMessage = 'Something went wrong! Please try again later.';
    let errorDetails = null;
    // Type narrowing for unknown error
    const error = err;
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        clientMessage = err.issues.map((issue) => issue.message).join(', ');
        errorDetails = {
            issues: err.issues.map((issue) => ({
                field: issue.path[issue.path.length - 1] || 'unknown',
                message: issue.message,
            })),
        };
    }
    else if (err instanceof AppError_1.AppError) {
        statusCode = err.statusCode;
        clientMessage = err.message;
    }
    else if (error.name === 'UnauthorizedError' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
        statusCode = 401;
        clientMessage = 'Your session has expired or is invalid. Please log in again.';
    }
    else if (error.statusCode) {
        statusCode = error.statusCode;
        clientMessage = error.message || clientMessage;
    }
    if (!isProduction) {
        console.error('[DEV_ERROR_LOG]:', {
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method,
            message: error.message,
            stack: error.stack,
        });
    }
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: clientMessage,
        errorDetails: errorDetails || null,
        ...(!isProduction && {
            developerError: {
                rawMessage: error.message,
                stack: error.stack,
            },
        }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
