
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
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode: number = err.statusCode || 500;
  let clientMessage: string = 'Something went wrong! Please try again later.';
  let errorDetails: any = null;

  // 1. Zod Validation Error Handling
  if (err instanceof ZodError) {
    statusCode = 400;
    clientMessage = err.issues.map((issue) => issue.message).join(', ');
    errorDetails = err.issues.map((issue) => ({
      field: issue.path[issue.path.length - 1] || 'unknown',
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
  // 3. NEW: Prisma Validation Errors 
  else if (err instanceof Prisma.PrismaClientValidationError || err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    clientMessage = 'প্রদত্ত তথ্যগুলো সঠিক নয় বা ডাটা ফরম্যাটে ভুল রয়েছে। দয়া করে ফর্মের ইনপুটগুলো চেক করুন।';
  }
  // 4. Custom AppError (Domain/Business Logic Errors)
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    clientMessage = err.message;
  }
  // 5. JWT Authentication Errors
  else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    clientMessage = 'Your session has expired or is invalid. Please log in again.';
  }
  // 6. Unknown or Unhandled Internal Server Errors
  else {
    statusCode = 500;
    clientMessage = 'An internal server error occurred. Please try again later.';
  }


  if (!isProduction) {
    console.error('[DEV_ERROR_LOG]:', {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: err.stack,
    });
  }

  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: clientMessage,
    errorDetails: errorDetails || null,
  
    ...(process.env.NODE_ENV === 'development' && {
      developerError: {
        rawMessage: err.message,
        stack: err.stack,
      },
    }),
  });
}; 