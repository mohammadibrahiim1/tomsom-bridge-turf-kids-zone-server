import { Request, Response } from 'express';
import sendResponse from '../../shared/utils/response';
import { AuthService } from './auth.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../shared/errors/AppError';
import { registerUserSchema } from '../user/user.validation';

const isProduction = process.env.NODE_ENV === 'production';

// register user function
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerUserSchema.parse(req.body);

  const result = await AuthService.registerUser(validatedData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'রেজিস্ট্রেশন সফল হয়েছে! অ্যাকাউন্টটি বর্তমানে অনুমোদনের জন্য অপেক্ষমাণ (PENDING) রয়েছে।',
    data: result,
  });
});

// login user function
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, isMustChangePassword } = result;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', //
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  // Set Refresh Token into HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 days
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Welcome to tomsom turf!',
    data: {
      isMustChangePassword,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 5 * 60 * 1000,
  });

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'New access token generated successfully!',
    data: null,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  await AuthService.logoutUser(refreshToken);

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged out successfully!',
    data: null,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  const result = await AuthService.getMe(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'successful!',
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};
