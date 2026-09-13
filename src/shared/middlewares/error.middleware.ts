import { Request, Response, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = 500;
  let clientMessage = 'Something went wrong! Please try again later.';
  let errorDetails: Record<string, unknown> | null = null;

  // Type narrowing for unknown error
  const error = err as {
    statusCode?: number;
    message?: string;
    name?: string;
    stack?: string;
  };

  if (err instanceof ZodError) {
    statusCode = 400;
    clientMessage = err.issues.map((issue) => issue.message).join(', ');
    errorDetails = {
      issues: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1] || 'unknown',
        message: issue.message,
      })),
    };
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = err.message;
  } else if (
    error.name === 'UnauthorizedError' ||
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    statusCode = 401;
    clientMessage = 'Your session has expired or is invalid. Please log in again.';
  } else if (error.statusCode) {
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