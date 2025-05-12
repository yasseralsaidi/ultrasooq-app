import * as Yup from "yup";

export const ForgetPasswordSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Not a valid email"),
});
