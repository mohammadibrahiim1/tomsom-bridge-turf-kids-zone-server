import z from 'zod';

// ========================================
// REGISTER VALIDATION
// ========================================

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters'),

  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters'),

  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .refine(
      (val) => val.endsWith('@gmail.com'),
      {
        message:
          'Email must be a valid @gmail.com address',
      },
    )
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(
      /^01[3-9]\d{8}$/,
      'Phone number must be a valid 11-digit BD number',
    ),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

// ========================================
// LOGIN VALIDATION
// ========================================

export const loginUserSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(
      1,
      'Username, email or phone number is required',
    ),

  password: z
    .string()
    .min(1, 'Password is required'),
});

// ========================================
// TYPES
// ========================================

export type TRegisterInput =
  z.infer<typeof registerUserSchema>;

export type TLoginInput =
  z.infer<typeof loginUserSchema>;