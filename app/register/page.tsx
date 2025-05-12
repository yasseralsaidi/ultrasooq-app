"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/apis/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EMAIL_REGEX_LOWERCASE,
  TRADE_ROLE_LIST,
  PUREMOON_TOKEN_KEY,
} from "@/utils/constants";
import { setCookie } from "cookies-next";
import PolicyContent from "@/components/shared/PolicyContent";
import TermsContent from "@/components/shared/TermsContent";
import ControlledTextInput from "@/components/shared/Forms/ControlledTextInput";
import ControlledPhoneInput from "@/components/shared/Forms/ControlledPhoneInput";
import BackgroundImage from "@/public/images/before-login-bg.png";
import FacebookIcon from "@/public/images/facebook-icon.png";
import GoogleIcon from "@/public/images/google-icon.png";
import { useSession, signIn } from "next-auth/react";
import { getLoginType } from "@/utils/helper";
import Link from "next/link";
import LoaderWithMessage from "@/components/shared/LoaderWithMessage";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const formSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, {
        message: "First Name is required",
      })
      .max(50, {
        message: "First Name must be less than 50 characters",
      }),
    lastName: z
      .string()
      .trim()
      .min(2, { message: "Last Name is required" })
      .max(50, {
        message: "Last Name must be less than 50 characters",
      }),
    email: z
      .string()
      .trim()
      .min(5, { message: "Email Address is required" })
      .email({
        message: "Invalid Email Address",
      })
      .refine((val) => (EMAIL_REGEX_LOWERCASE.test(val) ? true : false), {
        message: "Email must be in lower case",
      }),
    initialPassword: z
      .string({ required_error: "Login Password is required" })
      .trim()
      .min(1, {
        message: "Login Password is required",
      })
      .min(8, {
        message: "Password must be longer than or equal to 8 characters",
      }),
    password: z
      .string({ required_error: "Login Password is required" })
      .trim()
      .min(1, {
        message: "Confirm Password is required",
      }),
    cc: z.string().trim(),
    phoneNumber: z
      .string()
      .trim()
      .min(2, {
        message: "Phone Number is required",
      })
      .min(8, {
        message: "Phone Number must be minimum of 8 digits",
      })
      .max(20, {
        message: "Phone Number cannot be more than 20 digits",
      }),
    tradeRole: z.string().trim().min(2, {
      message: "Trade Role is required",
    }),
    acceptTerms: z.boolean().refine((val) => val, {
      message: "You must accept the Terms Of Use & Privacy Policy",
    }),
  })
  .superRefine(({ initialPassword, password }, ctx) => {
    if (initialPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["password"],
      });
    }
  });

export default function RegisterPage() {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      initialPassword: "",
      password: "",
      phoneNumber: "",
      cc: "",
      tradeRole: "",
      acceptTerms: false,
    },
  });

  const handleToggleTermsModal = () => setIsTermsModalOpen(!isTermsModalOpen);
  const handleTogglePrivacyModal = () =>
    setIsPrivacyModalOpen(!isPrivacyModalOpen);

  const register = useRegister();

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const loginType = session ? getLoginType() : "MANUAL";
    const response = await register.mutateAsync({
      ...formData,
      loginType: loginType as "MANUAL" | "GOOGLE" | "FACEBOOK",
    });

    if (response?.status && response?.otp) {
      toast({
        title: t("verification_code_sent"),
        description: t("verification_code_info"),
        variant: "success",
      });
      sessionStorage.setItem("email", formData.email.toLowerCase());
      form.reset();
      router.push("/otp-verify");
    } else if (response?.status && response?.accessToken) {
      // setCookie(PUREMOON_TOKEN_KEY, response.accessToken);
      setCookie(PUREMOON_TOKEN_KEY, response.accessToken, {
        // 7 days
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      toast({
        title: t("registration_successful"),
        description: response.message,
        variant: "success",
      });
      form.reset();
      router.push("/profile");
    } else {
      toast({
        title: t("registration_failed"),
        description: response.message,
        variant: "danger",
      });
    }
  };

  useEffect(() => {
    if (session && session?.user) {
      form.reset({
        firstName: session?.user?.name?.split(" ")[0] || "",
        lastName: session?.user?.name?.split(" ")[1] || "" || "",
        email: session?.user?.email || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // console.log(session);

  return (
    <>
      <title dir={langDir} translate="no">{t("register")} | Ultrasooq</title>
      <section className="relative w-full py-7">
        <div className="absolute left-0 top-0 -z-10 h-full w-full">
          <Image
            src={BackgroundImage}
            className="h-full w-full object-cover object-center"
            alt="background"
            fill
            priority
          />
        </div>
        <div className="container relative z-10 m-auto">
          <div className="flex">
            <div className="auth-page-box m-auto mb-12 w-11/12 rounded-lg border border-solid border-gray-300 bg-white p-7 shadow-sm sm:p-12 md:w-9/12 lg:w-7/12">
              <div className="text-normal m-auto mb-7 w-full text-center text-sm leading-6 text-light-gray">
                <h2
                  className="mb-3 text-center text-3xl font-semibold leading-8 text-color-dark sm:text-4xl sm:leading-10"
                  dir={langDir}
                  translate="no"
                >
                  {t("registration")}
                </h2>
                <p dir={langDir} translate="no">{t("create_your_account")}</p>
              </div>
              <div className="w-full">
                <ul className="flex w-full flex-wrap items-center justify-between">
                  <li className="mb-3 w-full p-0 sm:mb-0 sm:w-6/12 sm:pr-3">
                    <Button
                      variant="outline"
                      className="inline-flex w-full items-center justify-center rounded-md border border-solid border-gray-300 px-5 py-6 text-sm font-normal leading-4 text-light-gray"
                      onClick={() => {
                        localStorage.setItem("loginType", "FACEBOOK");
                        signIn("facebook");
                      }}
                      dir={langDir}
                      translate="no"
                    >
                      <Image
                        src={FacebookIcon}
                        className="mr-1.5"
                        alt="google-icon"
                        height={26}
                        width={26}
                      />
                      <span>{t("facebook_sign_up")}</span>
                    </Button>
                  </li>
                  <li className="w-full p-0 sm:w-6/12 sm:pl-3">
                    <Button
                      variant="outline"
                      className="inline-flex w-full items-center justify-center rounded-md border border-solid border-gray-300 px-5 py-6 text-sm font-normal leading-4 text-light-gray"
                      onClick={() => {
                        localStorage.setItem("loginType", "GOOGLE");
                        signIn("google");
                      }}
                      dir={langDir}
                      translate="no"
                    >
                      <Image
                        src={GoogleIcon}
                        className="mr-1.5"
                        alt="google-icon"
                        height={26}
                        width={26}
                      />
                      <span>{t("google_sign_up")}</span>
                    </Button>
                  </li>
                </ul>
              </div>
              <div className="relative w-full py-5 text-center before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:block before:h-px before:w-full before:bg-gray-200 before:content-['']">
                <span className="relative z-10 bg-white p-2.5 text-sm font-normal leading-8 text-gray-400">
                  Or
                </span>
              </div>
              <div className="w-full">
                <Form {...form}>
                  <form
                    className="flex flex-wrap"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="tradeRole"
                      render={({ field }) => (
                        <FormItem className="mb-4 flex w-full flex-col items-center md:flex-row md:items-start">
                          <FormLabel
                            className="mb-3 mr-6 capitalize md:mb-0"
                            dir={langDir}
                            translate="no"
                          >
                            {t("select_trade_role")}:
                          </FormLabel>
                          <div className="!mt-0">
                            <FormControl className="mb-2">
                              <RadioGroup
                                className="!mt-0 flex items-center gap-4"
                                onValueChange={field.onChange}
                              >
                                {TRADE_ROLE_LIST.map((role) => (
                                  <FormItem
                                    key={role.value}
                                    className="flex items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <div
                                        key={role.value}
                                        className="flex items-center space-x-2"
                                      >
                                        <RadioGroupItem
                                          value={role.value}
                                          id={role.value}
                                        />
                                        <FormLabel htmlFor={role.value}>
                                          {role.label}
                                        </FormLabel>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <ControlledTextInput
                      label={t("first_name")}
                      name="firstName"
                      placeholder={t("enter_first_name")}
                      dir={langDir}
                      translate="no"
                    />

                    <ControlledTextInput
                      label={t("last_name")}
                      name="lastName"
                      placeholder={t("enter_last_name")}
                      dir={langDir}
                      translate="no"
                    />

                    <ControlledTextInput
                      label={t("email")}
                      name="email"
                      placeholder={t("enter_email")}
                      disabled={
                        getLoginType() === "FACEBOOK" ||
                        getLoginType() === "GOOGLE"
                          ? !!session?.user?.email
                          : false
                      }
                      dir={langDir}
                      translate="no"
                    />

                    <ControlledTextInput
                      label={t("login_password")}
                      name="initialPassword"
                      placeholder={t("enter_login_password")}
                      type="password"
                      dir={langDir}
                      translate="no"
                    />

                    <ControlledTextInput
                      label={t("confirm_password")}
                      name="password"
                      placeholder={t("enter_login_password_again")}
                      type="password"
                      dir={langDir}
                      className="mb-2"
                      translate="no"
                    />

                    <ControlledPhoneInput
                      label={t("phone_number")}
                      name="phoneNumber"
                      countryName="cc"
                      placeholder={t("enter_phone_number")}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="mb-4 mt-3 flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border border-solid border-gray-300 data-[state=checked]:!bg-dark-orange"
                            />
                          </FormControl>
                          <div className="flex flex-col leading-none">
                            <div className="agreeText text-xs text-light-gray md:text-sm">
                              <span dir={langDir} translate="no">{t("i_agree")}</span>
                              <Button
                                onClick={handleToggleTermsModal}
                                type="button"
                                className="ml-1 h-auto bg-transparent p-0 shadow-none hover:bg-transparent"
                                dir={langDir}
                                translate="no"
                              >
                                <span className="text-xs text-light-gray underline md:text-sm">
                                  {t("terms_of_use")}
                                </span>
                              </Button>
                              <span className="mx-1 text-xs text-light-gray md:text-sm">
                                &
                              </span>
                              <Button
                                onClick={handleTogglePrivacyModal}
                                type="button"
                                className="ml-1 h-auto bg-transparent p-0 text-xs shadow-none hover:bg-transparent md:text-sm"
                                dir={langDir}
                                translate="no"
                              >
                                <span className="text-light-gray underline">
                                  {t("privacy_policy")}
                                </span>
                              </Button>
                            </div>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="mb-4 w-full">
                      <Button
                        disabled={register.isPending}
                        type="submit"
                        className="theme-primary-btn h-12 w-full rounded text-center text-lg font-bold leading-6"
                        translate="no"
                      >
                        {register.isPending ? (
                          <LoaderWithMessage message="Please wait" />
                        ) : (
                          t("agree_n_register")
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="mb-4 w-full text-center">
                  <span
                    className="text-sm font-medium leading-4 text-light-gray"
                    dir={langDir}
                    translate="no"
                  >
                    {t("already_have_an_account")}{" "}
                    <Link
                      href="/login"
                      className="cursor-pointer font-medium text-dark-orange"
                    >
                      {t("sign_in")}
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isTermsModalOpen} onOpenChange={handleToggleTermsModal}>
          <DialogContent className="max-h-[93vh] max-w-[90%] gap-0 p-0 md:!max-w-[90%] lg:!max-w-5xl">
            <DialogHeader className="border-b border-light-gray py-4">
              <DialogTitle
                className="text-center text-xl font-bold"
                dir={langDir}
                translate="no"
              >
                {t("terms_of_use")}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="term-policy-modal-content max-h-[82vh] overflow-y-scroll p-4 text-sm font-normal leading-7 text-color-dark">
              <TermsContent />
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isPrivacyModalOpen}
          onOpenChange={handleTogglePrivacyModal}
        >
          <DialogContent className="max-h-[93vh] max-w-[90%] gap-0 p-0 md:!max-w-[90%] lg:!max-w-5xl">
            <DialogHeader className="border-b border-light-gray py-4">
              <DialogTitle
                className="text-center text-xl font-bold"
                dir={langDir}
                translate="no"
              >
                {t("privacy_policy")}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="term-policy-modal-content max-h-[82vh] overflow-y-scroll p-4 text-sm font-normal leading-7 text-color-dark">
              <PolicyContent />
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}
