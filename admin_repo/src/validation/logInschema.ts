import * as Yup from "yup";

export const LogInFormSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Not a valid email"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
});
