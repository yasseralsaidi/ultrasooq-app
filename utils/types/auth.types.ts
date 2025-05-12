export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILogin {
  accessToken: string;
  data: {
    status: "ACTIVE" | "INACTIVE" | "DELETE";
  };
  message: string;
  status: boolean;
  otp: number;
}

export interface IRegisterRequest {
  loginType: "MANUAL" | "GOOGLE" | "FACEBOOK";
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  cc: string;
  phoneNumber: string;
  tradeRole: string;
}

export interface IRegister {
  otp: number;
  message: string;
  status: boolean;
  accessToken: string;
}

export interface IVerifyOtpRequest {
  email: string;
  otp: number;
}

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: "MALE" | "FEMALE";
  tradeRole: "BUYER" | "COMPANY" | "FREELANCER";
  cc: string;
  phoneNumber: string;
}

export interface IVerifyOtp {
  accessToken: string;
  data: User;
  message: string;
  status: boolean;
}

export interface IResendOtpRequest {
  email: string;
}

export interface IResendOtp {
  status: boolean;
  message: string;
  otp: number;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IForgotPassword {
  otp: number;
  message: string;
  status: boolean;
}

export interface IResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPassword {
  message: string;
  status: boolean;
  data: any;
  statusCode: number;
}

export interface IPasswordResetVerifyOtpRequest extends IVerifyOtpRequest {}

export interface IPasswordResetVerify {
  status: boolean;
  message: string;
  accessToken: string;
}

export interface IChangePasswordRequest extends IResetPasswordRequest {
  password: string;
}

export interface IChangePassword extends IResetPassword {}

export interface IChangeEmailRequest extends IForgotPasswordRequest {}

export interface IChangeEmail extends IForgotPassword {}

export interface IChangeEmailVerifyRequest extends IVerifyOtpRequest {}

export interface IChangeEmailVerify {
  data: {};
  message: string;
  status: boolean;
}
