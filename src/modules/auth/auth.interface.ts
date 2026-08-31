export type ILoginUser = {
  identity: string; // Email, Phone, or Username
  password: string;
};

export type IAuthResponse = {
  accessToken: string;
  refreshToken: string;
  isMustChangePassword: boolean;
  requiresOtp?: boolean;
};
