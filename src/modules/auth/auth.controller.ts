import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AuthService } from './auth.service';
import { registerUserSchema } from '../user/user.validation';

import { catchAsync } from '../../shared/utils/catchAsync';
import { AppError } from '../../shared/errors/AppError';
import sendResponse from '../../shared/utils/response';

const isProduction =
  process.env.NODE_ENV === 'production';

// ========================================
// REGISTER
// ========================================

const registerUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const validatedData =
      registerUserSchema.parse(req.body);

    const result =
      await AuthService.registerUser(
        validatedData,
      );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message:
        'রেজিস্ট্রেশন সফল হয়েছে! অ্যাকাউন্টটি বর্তমানে অনুমোদনের জন্য অপেক্ষমাণ (PENDING) রয়েছে।',
      data: result,
    });
  },
);

// ========================================
// LOGIN
// ========================================

const loginUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const result =
      await AuthService.loginUser(req.body);

    const {
      refreshToken,
      accessToken,
      user,
    } = result;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? 'none'
        : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie(
      'refreshToken',
      refreshToken,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? 'none'
          : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      },
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message:
        'Login successful! Welcome to Tomsom Turf.',
      data: {
        user,
        accessToken,
      },
    });
  },
);

// ========================================
// REFRESH TOKEN
// ========================================

const refreshToken = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const token =
      req.cookies?.refreshToken;

    if (!token) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Refresh token is required.',
      );
    }

    const result =
      await AuthService.refreshToken(
        token,
      );

    res.cookie(
      'accessToken',
      result.accessToken,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? 'none'
          : 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      },
    );

    res.cookie(
      'refreshToken',
      result.refreshToken,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? 'none'
          : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      },
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message:
        'Access token generated successfully.',
      data: {
        accessToken:
          result.accessToken,
      },
    });
  },
);

// ========================================
// LOGOUT
// ========================================

const logoutUser = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const token =
      req.cookies?.refreshToken;

    await AuthService.logoutUser(token);

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction
        ? 'none'
        : 'lax',
      path: '/',
    });

    res.clearCookie(
      'refreshToken',
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
          ? 'none'
          : 'lax',
        path: '/',
      },
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'See you again!',
      data: null,
    });
  },
);

// ========================================
// GET CURRENT USER
// ========================================

const getMe = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized!',
      );
    }

    const result =
      await AuthService.getMe(userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Successful!',
      data: result,
    });
  },
);

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};