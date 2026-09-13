import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  username?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER' | 'EMPLOYEE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  avatar_url?: string | null;
  is_must_change_password?: boolean;
  password_reset_token?: string | null;
  password_reset_expires?: Date | null;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  otp_code?: string | null;
  otp_expires_at?: Date | null;
  verification_type?: 'EMAIL' | 'PHONE' | 'BOTH' | 'NONE';
  is_active?: boolean;
  is_deleted?: boolean;
  last_login?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', userSchema);

export interface IRefreshToken extends Document {
  token: string;
  user_id: Types.ObjectId;
  expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);