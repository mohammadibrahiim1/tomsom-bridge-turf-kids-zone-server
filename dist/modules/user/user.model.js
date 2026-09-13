"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'EMPLOYEE'],
        default: 'CUSTOMER',
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
    },
    avatar_url: { type: String, default: null },
    is_must_change_password: { type: Boolean, default: false },
    password_reset_token: { type: String, default: null },
    password_reset_expires: { type: Date, default: null },
    is_email_verified: { type: Boolean, default: false },
    is_phone_verified: { type: Boolean, default: false },
    otp_code: { type: String, default: null },
    otp_expires_at: { type: Date, default: null },
    verification_type: {
        type: String,
        enum: ['EMAIL', 'PHONE', 'BOTH', 'NONE'],
        default: 'NONE',
    },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    last_login: { type: Date, default: null },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', userSchema);
const refreshTokenSchema = new mongoose_1.Schema({
    token: { type: String, required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    expires_at: { type: Date, required: true },
}, {
    timestamps: true,
});
exports.RefreshToken = (0, mongoose_1.model)('RefreshToken', refreshTokenSchema);
