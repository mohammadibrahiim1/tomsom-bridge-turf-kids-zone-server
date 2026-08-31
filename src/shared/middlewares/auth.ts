import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        role: string;
        email?: string;
      };
    }
  }
}

export const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // 2. Token Verify
    let verifiedUser: JwtPayload;
    try {
      verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY as Secret) as JwtPayload;
    } catch (err) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired access token!');
    }

    req.user = verifiedUser as Express.Request['user'];

    // 3. Role-based authorization
    if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Forbidden access! You do not have permission.');
    }

    next();
  });
};
