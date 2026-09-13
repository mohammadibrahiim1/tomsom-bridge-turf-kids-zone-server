import bcrypt from 'bcryptjs';
import { Secret } from 'jsonwebtoken';
import { ILoginUser, IRegisterUser } from './auth.interface';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../shared/errors/AppError';
import { createToken, verifyToken } from '../../shared/utils/jwt';
import { User, RefreshToken } from '../user/user.model';
import mongoose from 'mongoose';

const registerUser = async (payload: IRegisterUser) => {
  const { name, phone, username, password, email, avatarUrl } = payload;

  const existingUser = await User.findOne({
    $or: [
      ...(username ? [{ username }] : []),
      ...(phone ? [{ phone }] : []),
      ...(email ? [{ email }] : []),
    ],
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

  const newUser = await User.create({
    name,
    phone,
    username,
    password: hashedPassword,
    email: email || null,
    avatar_url: avatarUrl || null,
    role: 'CUSTOMER',
    status: 'APPROVED',
  });

  return {
    id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    phone: newUser.phone,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    createdAt: newUser.createdAt,
  };
};

const loginUser = async (payload: ILoginUser) => {
  const { identity, password } = payload;
  const cleanIdentity = identity.trim();
  const cleanPassword = password.trim();

  const user = await User.findOne({
    $or: [
      { email: cleanIdentity },
      { username: cleanIdentity },
      { phone: cleanIdentity },
    ],
    is_deleted: false,
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!user.is_active) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
  }

  const isPasswordMatched = await bcrypt.compare(cleanPassword, user.password);
  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const jwtPayload = {
    id: user._id,
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY as Secret, '15m');
  const refreshToken = createToken({ id: user._id }, process.env.JWT_REFRESH_SECRET_KEY as Secret, '1d');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RefreshToken.create(
      [
        {
          token: refreshToken,
          user_id: user._id,
          expires_at: expiresAt,
        },
      ],
      { session }
    );

    await User.findByIdAndUpdate(
      user._id,
      { last_login: new Date() },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isMustChangePassword: user.is_must_change_password,
    },
  };
};

const refreshTokenService = async (token: string) => {
  try {
    verifyToken(token, process.env.JWT_REFRESH_SECRET_KEY as Secret);
  } catch {
    throw new AppError(StatusCodes.FORBIDDEN, 'Invalid Refresh Token');
  }

  const existingRefreshToken = await RefreshToken.findOne({ token }).populate('user_id');

  if (!existingRefreshToken || !existingRefreshToken.user_id) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Refresh token revoked or not found');
  }

  const user = existingRefreshToken.user_id as unknown as {
    _id: mongoose.Types.ObjectId;
    role: string;
    email?: string | null;
  };

  let newAccessToken:string ;
  
  let newRefreshToken:string;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await RefreshToken.deleteOne({ token }).session(session);

    const jwtPayload = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    newAccessToken = createToken(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY as Secret, '15m');
    newRefreshToken = createToken({ id: user._id }, process.env.JWT_REFRESH_SECRET_KEY as Secret, '1d');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await RefreshToken.create(
      [
        {
          token: newRefreshToken,
          user_id: user._id,
          expires_at: expiresAt,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (refreshToken?: string) => {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  return null;
};

const getMe = async (userId: string) => {
  const user = await User.findOne({
    _id: userId,
    is_deleted: false,
    is_active: true,
  }).select('name phone role email username avatar_url');

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User profile not found or account deactivated!');
  }

  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatar_url,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken: refreshTokenService,
  logoutUser,
  getMe,
};