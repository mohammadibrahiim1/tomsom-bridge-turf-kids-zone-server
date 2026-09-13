"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserSchema = exports.registerUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.registerUserSchema = zod_1.default
    .object({
    name: zod_1.default.string().min(2, 'Name must be at least 5 characters'),
    username: zod_1.default.string().min(3, 'Username must be at least 6 characters'),
    email: zod_1.default
        .string()
        .email('Invalid email format')
        .refine((val) => !val || val.endsWith('@gmail.com'), {
        message: 'Email must be a valid @gmail.com address',
    })
        .optional(),
    phone: zod_1.default.string().regex(/^01[3-9]\d{8}$/, 'Phone number must be a valid 11-digit BD number'),
    password: zod_1.default.string().min(6, 'Password must be at least 6 characters'),
    avatarUrl: zod_1.default.string().url('Invalid photo URL').optional(),
})
    .refine((data) => data.email || data.phone, {
    message: 'Either Email or Phone number is required for registration',
    path: ['phone'], // এররটি ফোনের নিচে দেখাবে
});
exports.loginUserSchema = zod_1.default.object({
    identity: zod_1.default.string().min(1, 'Username, email or phone number is required'),
    password: zod_1.default.string().min(1, 'Password is required'),
});
