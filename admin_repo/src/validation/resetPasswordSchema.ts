import * as Yup from "yup";

export const ResetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});
