import z from 'zod';

export const registerUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),

    email: z
      .string()
      .email('Invalid email format')
      .refine((val) => !val || val.endsWith('@gmail.com'), {
        message: 'Email must be a valid @gmail.com address',
      })
      .optional(),

    phone: z.string().regex(/^01[3-9]\d{8}$/, 'Phone number must be a valid 11-digit BD number'),

    password: z.string().min(6, 'Password must be at least 6 characters'),
    avatarUrl: z.string().url('Invalid photo URL').optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either Email or Phone number is required for registration',
    path: ['phone'], // এররটি ফোনের নিচে দেখাবে
  });

export type TRegisterInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  identity: z.string().min(1, 'Username, email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export type TLoginInput = z.infer<typeof loginUserSchema>;
