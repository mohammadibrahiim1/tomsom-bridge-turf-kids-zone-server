import { TLoginInput, TRegisterInput } from "../user/user.validation";

export type ILoginUser = TLoginInput;
export type IRegisterUser = TRegisterInput;

// export type ILoginUser = {
//   identity: string; // Email, Phone, or Username
//   password: string;
// };

export type IAuthResponse = {
  accessToken: string;
  refreshToken: string;
  isMustChangePassword: boolean;
  requiresOtp?: boolean;
};

// export interface IRegisterUser {
//   name: string;
//   phone: string;
//   username: string;
//   password: string;
//   email?: string;
//   role?: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
// }
