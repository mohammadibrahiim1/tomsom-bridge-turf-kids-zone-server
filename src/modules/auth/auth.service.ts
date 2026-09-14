import bcrypt from 'bcryptjs';
import { Secret } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

import {
  Role,
  UserStatus,
} from '@prisma/client';

import {
  ILoginUser,
  IRegisterUser,
} from './auth.interface';

import { AppError } from '../../shared/errors/AppError';
import {
  createToken,
  verifyToken,
} from '../../shared/utils/jwt';

import { prisma } from '../../shared/config/db';

// ========================================
// REGISTER
// ========================================

const registerUser = async (
  payload: IRegisterUser,
) => {
  const {
    name,
    phone,
    username,
    password,
    email,
  } = payload;

  const existingUser =
    await prisma.user.findFirst({
      where: {
        OR: [
          ...(username
            ? [{ username }]
            : []),

          ...(phone
            ? [{ phone }]
            : []),

          ...(email
            ? [{ email }]
            : []),
        ],
      },
    });

  if (existingUser) {
    if (
      username &&
      existingUser.username === username
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
      );
    }

    if (
      phone &&
      existingUser.phone === phone
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'এই ফোন নম্বরটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।',
      );
    }

    if (
      email &&
      existingUser.email === email
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'এই ইমেইলটি ইতিমধ্যে রেজিস্টার্ড।',
      );
    }
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const newUser =
    await prisma.user.create({
      data: {
        name,
        phone: phone || null,
        username: username || null,
        password: hashedPassword,
        email: email || null,

        role: Role.CUSTOMER,
        status: UserStatus.PENDING,

        isActive: true,
        isDeleted: false,
        isMustChangePassword: false,
      },
    });

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    phone: newUser.phone,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    createdAt: newUser.createdAt,
  };
};

// ========================================
// LOGIN
// ========================================

const loginUser = async (
  payload: ILoginUser,
) => {
  const {
    identity,
    password,
  } = payload;

  const cleanIdentity =
    identity.trim();

  const cleanPassword =
    password.trim();

  if (
    !cleanIdentity ||
    !cleanPassword
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Identity and password are required.',
    );
  }

  const user =
    await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentity },
          { username: cleanIdentity },
          { phone: cleanIdentity },
        ],
        isDeleted: false,
      },
    });

  if (!user) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
    );
  }

  if (!user.isActive) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Your account has been deactivated. Please contact support.',
    );
  }

  const isPasswordMatched =
    await bcrypt.compare(
      cleanPassword,
      user.password,
    );

  if (!isPasswordMatched) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Invalid credentials',
    );
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env
      .JWT_ACCESS_SECRET_KEY as Secret,
    '15m',
  );

  const refreshToken = createToken(
    { id: user.id },
    process.env
      .JWT_REFRESH_SECRET_KEY as Secret,
    '1d',
  );

  const expiresAt = new Date(
    Date.now() +
      24 * 60 * 60 * 1000,
  );

  await prisma.$transaction(
    async (tx) => {
      await tx.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastLogin: new Date(),
        },
      });
    },
  );

  return {
    accessToken,
    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isMustChangePassword:
        user.isMustChangePassword,
    },
  };
};

// ========================================
// REFRESH TOKEN
// ========================================

const refreshTokenService = async (
  token: string,
) => {
  if (!token) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Refresh token is required.',
    );
  }

  try {
    verifyToken(
      token,
      process.env
        .JWT_REFRESH_SECRET_KEY as Secret,
    );
  } catch {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Invalid Refresh Token',
    );
  }

  const existingRefreshToken =
    await prisma.refreshToken.findUnique({
      where: {
        token,
      },
      include: {
        user: true,
      },
    });

  if (
    !existingRefreshToken ||
    !existingRefreshToken.user
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Refresh token revoked or not found',
    );
  }

  if (
    existingRefreshToken.expiresAt <
    new Date()
  ) {
    await prisma.refreshToken
      .deleteMany({
        where: { token },
      });

    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Refresh token has expired.',
    );
  }

  const user =
    existingRefreshToken.user;

  if (
    user.isDeleted ||
    !user.isActive
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'User account is inactive or unavailable.',
    );
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const newAccessToken =
    createToken(
      jwtPayload,
      process.env
        .JWT_ACCESS_SECRET_KEY as Secret,
      '15m',
    );

  const newRefreshToken =
    createToken(
      { id: user.id },
      process.env
        .JWT_REFRESH_SECRET_KEY as Secret,
      '1d',
    );

  const expiresAt = new Date(
    Date.now() +
      24 * 60 * 60 * 1000,
  );

  await prisma.$transaction(
    async (tx) => {
      await tx.refreshToken.delete({
        where: {
          token,
        },
      });

      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt,
        },
      });
    },
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ========================================
// LOGOUT
// ========================================

const logoutUser = async (
  refreshToken?: string,
) => {
  if (!refreshToken) {
    return null;
  }

  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
    },
  });

  return null;
};

// ========================================
// GET CURRENT USER
// ========================================

const getMe = async (
  userId: string,
) => {
  const user =
    await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        email: true,
        username: true,
        avatarUrl: true,
        isMustChangePassword: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'User profile not found or account deactivated!',
    );
  }

  return user;
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken:
    refreshTokenService,
  logoutUser,
  getMe,
};