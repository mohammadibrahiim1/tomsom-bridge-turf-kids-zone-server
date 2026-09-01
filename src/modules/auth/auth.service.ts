import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Secret } from 'jsonwebtoken';
import { AppError } from '../../shared/errors/AppError';
import { createToken, verifyToken } from '../../shared/utils/jwt';
import { ILoginUser, IRegisterUser } from './auth.interface';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

const registerUser = async (payload: IRegisterUser) => {
  const { name, phone, username, password, email, role } = payload;

  if (!name || !phone || !username || !password) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'নাম, ফোন নম্বর, ইউজারনেম এবং পাসওয়ারড প্রদান করুন।');
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { phone: phone }, ...(email ? [{ email: email }] : [])],
    },
  });

  if (existingUser) {
    if (existingUser.username === username)
      throw new AppError(StatusCodes.BAD_REQUEST, 'এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
    if (existingUser.phone === phone)
      throw new AppError(StatusCodes.BAD_REQUEST, 'এই ফোন নম্বরটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।');
    if (email && existingUser.email === email)
      throw new AppError(StatusCodes.BAD_REQUEST, 'এই ইমেইলটি ইতিমধ্যে রেজিস্টার্ড।');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userRole = role || Role.CUSTOMER;

  const uStatus = userRole === Role.CUSTOMER ? UserStatus.APPROVED : UserStatus.PENDING;

  const newUser = await prisma.user.create({
    data: {
      name,
      phone,
      username,
      password: hashedPassword,
      email: email || null,
      role: userRole,
      status: uStatus,
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return newUser;
};

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
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
};
