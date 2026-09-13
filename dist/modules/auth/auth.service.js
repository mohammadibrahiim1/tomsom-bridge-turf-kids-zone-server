"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = require("../../shared/errors/AppError");
const jwt_1 = require("../../shared/utils/jwt");
const user_model_1 = require("../user/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const registerUser = async (payload) => {
    const { name, phone, username, password, email, avatarUrl } = payload;
    const existingUser = await user_model_1.User.findOne({
        $or: [
            ...(username ? [{ username }] : []),
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
        ],
    });
    if (existingUser) {
        if (existingUser.username === username)
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
        if (existingUser.phone === phone)
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'এই ফোন নম্বরটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।');
        if (email && existingUser.email === email)
            throw new AppError_1.AppError(http_status_codes_1.StatusCodes.BAD_REQUEST, 'এই ইমেইলটি ইতিমধ্যে রেজিস্টার্ড।');
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = await user_model_1.User.create({
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
const loginUser = async (payload) => {
    const { identity, password } = payload;
    const cleanIdentity = identity.trim();
    const cleanPassword = password.trim();
    const user = await user_model_1.User.findOne({
        $or: [
            { email: cleanIdentity },
            { username: cleanIdentity },
            { phone: cleanIdentity },
        ],
        is_deleted: false,
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }
    if (!user.is_active) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(cleanPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }
    const jwtPayload = {
        id: user._id,
        role: user.role,
        email: user.email,
    };
    const accessToken = (0, jwt_1.createToken)(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY, '15m');
    const refreshToken = (0, jwt_1.createToken)({ id: user._id }, process.env.JWT_REFRESH_SECRET_KEY, '1d');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await user_model_1.RefreshToken.create([
            {
                token: refreshToken,
                user_id: user._id,
                expires_at: expiresAt,
            },
        ], { session });
        await user_model_1.User.findByIdAndUpdate(user._id, { last_login: new Date() }, { session });
        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
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
const refreshTokenService = async (token) => {
    try {
        (0, jwt_1.verifyToken)(token, process.env.JWT_REFRESH_SECRET_KEY);
    }
    catch {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Invalid Refresh Token');
    }
    const existingRefreshToken = await user_model_1.RefreshToken.findOne({ token }).populate('user_id');
    if (!existingRefreshToken || !existingRefreshToken.user_id) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.FORBIDDEN, 'Refresh token revoked or not found');
    }
    const user = existingRefreshToken.user_id;
    let newAccessToken;
    let newRefreshToken;
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        await user_model_1.RefreshToken.deleteOne({ token }).session(session);
        const jwtPayload = {
            id: user._id,
            role: user.role,
            email: user.email,
        };
        newAccessToken = (0, jwt_1.createToken)(jwtPayload, process.env.JWT_ACCESS_SECRET_KEY, '15m');
        newRefreshToken = (0, jwt_1.createToken)({ id: user._id }, process.env.JWT_REFRESH_SECRET_KEY, '1d');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user_model_1.RefreshToken.create([
            {
                token: newRefreshToken,
                user_id: user._id,
                expires_at: expiresAt,
            },
        ], { session });
        await session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
const logoutUser = async (refreshToken) => {
    if (refreshToken) {
        await user_model_1.RefreshToken.deleteOne({ token: refreshToken });
    }
    return null;
};
const getMe = async (userId) => {
    const user = await user_model_1.User.findOne({
        _id: userId,
        is_deleted: false,
        is_active: true,
    }).select('name phone role email username avatar_url');
    if (!user) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, 'User profile not found or account deactivated!');
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
exports.AuthService = {
    registerUser,
    loginUser,
    refreshToken: refreshTokenService,
    logoutUser,
    getMe,
};
