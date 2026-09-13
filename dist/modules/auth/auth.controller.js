"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const http_status_codes_1 = require("http-status-codes");
const user_validation_1 = require("../user/user.validation");
const catchAsync_1 = require("../../shared/utils/catchAsync");
const AppError_1 = require("../../shared/errors/AppError");
const response_1 = __importDefault(require("../../shared/utils/response"));
const isProduction = process.env.NODE_ENV === 'production';
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const validatedData = user_validation_1.registerUserSchema.parse(req.body);
    const result = await auth_service_1.AuthService.registerUser(validatedData);
    (0, response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'রেজিস্ট্রেশন সফল হয়েছে! অ্যাকাউন্টটি বর্তমানে অনুমোদনের জন্য অপেক্ষমাণ (PENDING) রয়েছে।',
        data: result,
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.AuthService.loginUser(req.body);
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
    (0, response_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Login successful! Welcome to Tomsom Turf.',
        data: { user, accessToken },
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.cookies;
    const result = await auth_service_1.AuthService.refreshToken(refreshToken);
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
    (0, response_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'generate access token!',
        data: { accessToken: result?.accessToken },
    });
});
const logoutUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.cookies;
    await auth_service_1.AuthService.logoutUser(refreshToken);
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
    (0, response_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'See you again!',
        data: null,
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError_1.AppError(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }
    const result = await auth_service_1.AuthService.getMe(userId);
    (0, response_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'successful!',
        data: result,
    });
});
exports.AuthController = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    getMe,
};
