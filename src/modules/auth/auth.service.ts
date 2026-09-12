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

// user login
const loginUser = async (payload: ILoginUser) => {
  const { identity, password } = payload;

  // 1. Required Check (Empty or Missing fields)
  if (!identity || !identity.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Email or Username is required');
  }

  if (!password || !password.trim()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
  }

  const cleanIdentity = identity.trim();
  const cleanPassword = password.trim();

  // 2. Find user by Email OR Username
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: cleanIdentity }, { username: cleanIdentity }],
      isDeleted: false,
    },
  });

  // Security Note: User না থাকলেও 'Invalid credentials' থ্রো করা ভালো
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  // 3. Account Status Check
  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
  }

  // 4. Password Check
  const isPasswordMatched = await bcrypt.compare(cleanPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  // 5. JWT Payload setup
  const jwtPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  // 6. Generate Tokens
  const accessToken = createToken(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY as Secret, '15m');

  const refreshToken = createToken({ id: user.id }, process.env.JWT_REFRESH_SECRET_KEY as Secret, '1d');

  // 7. DB Transaction for Refresh Token & Last Login
  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }),
  ]);

  // 8. Safe Return Data
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isMustChangePassword: user.isMustChangePassword,
    },
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

  const newAccessToken = createToken(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY as Secret, '15m');

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
