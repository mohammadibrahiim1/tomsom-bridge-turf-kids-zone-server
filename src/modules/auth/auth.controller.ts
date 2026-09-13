import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { StatusCodes } from 'http-status-codes';
import { registerUserSchema } from '../user/user.validation';
import { catchAsync } from '../../shared/utils/catchAsync';
import { AppError } from '../../shared/errors/AppError';
import sendResponse from '../../shared/utils/response';

const isProduction = process.env.NODE_ENV === 'production';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerUserSchema.parse(req.body);
  const result = await AuthService.registerUser(validatedData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'রেজিস্ট্রেশন সফল হয়েছে! অ্যাকাউন্টটি বর্তমানে অনুমোদনের জন্য অপেক্ষমাণ (PENDING) রয়েছে।',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, user } = result;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 5 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Login successful! Welcome to Tomsom Turf.',
    data: { user, accessToken },
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
    message: 'generate access token!',
    data: { accessToken: result?.accessToken },
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
    path: '/',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'See you again!',
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