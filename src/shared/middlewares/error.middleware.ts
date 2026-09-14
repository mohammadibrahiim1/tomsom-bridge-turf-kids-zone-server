import {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = 500;
  let clientMessage = 'Something went wrong! Please try again later.';
  let errorDetails: Record<string, unknown> | null = null;

  const error =
    err instanceof Error
      ? err
      : new Error('Unknown error occurred');

  // ==============================
  // ZOD VALIDATION ERROR
  // ==============================
  if (err instanceof ZodError) {
    statusCode = 400;

    clientMessage = err.issues
      .map((issue) => issue.message)
      .join(', ');

    errorDetails = {
      issues: err.issues.map((issue) => ({
        field:
          issue.path.length > 0
            ? issue.path.join('.')
            : 'unknown',
        message: issue.message,
      })),
    };
  }

  // ==============================
  // CUSTOM APP ERROR
  // ==============================
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = err.message;
  }

  // ==============================
  // JWT ERRORS
  // ==============================
  else if (
    error.name === 'UnauthorizedError' ||
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    statusCode = 401;

    clientMessage =
      'Your session has expired or is invalid. Please log in again.';
  }

  // ==============================
  // OTHER ERRORS WITH STATUS CODE
  // ==============================
  else if (
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
  ) {
    statusCode = (error as { statusCode: number }).statusCode;
    clientMessage = error.message || clientMessage;
  }

  // ==============================
  // DEVELOPMENT LOG
  // ==============================
  if (!isProduction) {
    console.error('[DEV_ERROR_LOG]:', {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      message: error.message,
      stack: error.stack,
    });
  }

  // ==============================
  // RESPONSE
  // ==============================
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: clientMessage,
    errorDetails,

    ...(!isProduction && {
      developerError: {
        rawMessage: error.message,
        stack: error.stack,
      },
    }),
  });
};