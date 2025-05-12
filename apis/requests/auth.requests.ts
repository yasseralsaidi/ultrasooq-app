import { PUREMOON_TEMP_TOKEN_KEY, PUREMOON_TOKEN_KEY } from "@/utils/constants";
import {
  IChangeEmailRequest,
  IChangeEmailVerifyRequest,
  IChangePasswordRequest,
  IForgotPasswordRequest,
  ILoginRequest,
  IPasswordResetVerifyOtpRequest,
  IRegisterRequest,
  IResendOtpRequest,
  IResetPasswordRequest,
  IVerifyOtpRequest,
} from "@/utils/types/auth.types";
import axios from "axios";
import { getCookie } from "cookies-next";

export const register = (payload: IRegisterRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
    data: payload,
  });
};

export const verifyOtp = (payload: IVerifyOtpRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/registerValidateOtp`,
    data: payload,
  });
};

export const resendOtp = (payload: IResendOtpRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/resendOtp`,
    data: payload,
  });
};

export const login = (payload: ILoginRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/login`,
    data: payload,
  });
};

export const forgotPassword = (payload: IForgotPasswordRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/forgetPassword`,
    data: payload,
  });
};

export const resetPassword = (payload: IResetPasswordRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/resetPassword`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TEMP_TOKEN_KEY),
    },
  });
};

export const passwordResetVerify = (
  payload: IPasswordResetVerifyOtpRequest,
) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/verifyOtp`,
    data: payload,
  });
};

export const changePassword = (payload: IChangePasswordRequest) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/changePassword`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const changeEmail = (payload: IChangeEmailRequest) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/changeEmail`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const emailChangeVerify = (payload: IChangeEmailVerifyRequest) => {
  return axios({
    method: "PATCH",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/verifyEmail`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + getCookie(PUREMOON_TOKEN_KEY),
    },
  });
};

export const socialLogin = (payload: any) => {
  return axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/user/socialLogin`,
    data: payload,
  });
};
