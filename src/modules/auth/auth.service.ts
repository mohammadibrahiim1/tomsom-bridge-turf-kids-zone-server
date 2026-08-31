import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Secret } from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError';
import { createToken, verifyToken } from '../../shared/utils/jwt';
import { ILoginUser } from './auth.interface';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

const loginUser = async (payload: ILoginUser) => {
  const { identity, password } = payload;

  // 1. Find user by Email OR Username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: identity.trim(),
        },
        {
          username: identity.trim(),
        },
      ],
      isDeleted: false,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User does not exist');
  }

  // 2. Check account status
  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Your account is deactivated');
  }

  // 3. Check password
  const isPasswordMatched = await bcrypt.compare(password.trim(), user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Password incorrect');
  }

  // 4. JWT Payload
  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  // 5. Generate Access Token
  const accessToken = createToken(jwtPayload, process.env.JWT_SECRET_KEY as Secret, '5m');

  // 6. Generate Refresh Token
  const refreshToken = createToken({ id: user.id }, process.env.JWT_REFRESH_SECRET_KEY as Secret, '1d');

  // 7. Save Refresh Token & Update Last Login
  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),

    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    }),
  ]);

  // 8. Return Login Data
  return {
    accessToken,
    refreshToken,
    isMustChangePassword: user.isMustChangePassword,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, process.env.JWT_REFRESH_SECRET_KEY as Secret);
  } catch (err) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Invalid Refresh Token');
  }

  const existingRefreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!existingRefreshToken) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Refresh token revoked or not found');
  }

  // Token Rotation:
  await prisma.refreshToken.delete({ where: { token } });

  const jwtPayload = {
    id: existingRefreshToken.user.id,
    role: existingRefreshToken.user.role,
    email: existingRefreshToken.user.email,
  };

  const newAccessToken = createToken(jwtPayload, process.env.JWT_SECRET_KEY as Secret, '15m');

  const newRefreshToken = createToken(
    { id: existingRefreshToken.user.id },
    process.env.JWT_REFRESH_SECRET_KEY as Secret,
    '1d',
  );

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: existingRefreshToken.user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (refreshToken?: string) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }
  return null;
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      isActive: true,
    },
    select: {
      id: true,
      // username: true,
      name: true,
      // email: true,
      phone: true,
      role: true,
      // avatarUrl: true,
      // isMustChangePassword: true,
      // isEmailVerified: true,
      // isPhoneVerified: true,
      // verificationType: true,
      // isActive: true,
      // lastLogin: true,
      // createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User profile not found or account deactivated!');
  }

  return user;
};

export const AuthService = {
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};
