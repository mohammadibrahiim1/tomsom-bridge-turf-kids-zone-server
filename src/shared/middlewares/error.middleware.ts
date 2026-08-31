// src/shared/errors/globalErrorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = err.statusCode || 500;
  let clientMessage = 'Something went wrong! Please try again later.';
  let errorDetails: any = null;

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    clientMessage = err.issues.map((issue) => issue.message).join(', ');
    errorDetails = err.issues.map((issue) => ({
      field: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  }
  // 2. Prisma Database Known Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'Field';
      clientMessage = `${field} already exists. Please use a different value.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      clientMessage = 'Requested record was not found.';
    } else {
      clientMessage = 'Database request failed due to invalid input data.';
    }
  }
  // 3. Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = err.message;
  }
  // 4. JWT Authentication Errors
  else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    clientMessage = 'Your session has expired or is invalid. Please log in again.';
  }
  // 5. Unknown Server Errors
  else {
    clientMessage = 'An internal server error occurred. Please try again later.';
  }

  // Developer Log
  console.error('💥 [ERROR LOG]:', {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  // Client Response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: clientMessage,
    errorDetails,
    ...(process.env.NODE_ENV === 'development' && {
      developerError: {
        rawMessage: err.message,
        stack: err.stack,
      },
    }),
  });
};
