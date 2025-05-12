"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import _ from "lodash";
import { useLogin, useSocialLogin } from "@/apis/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { EMAIL_REGEX_LOWERCASE, PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { setCookie } from "cookies-next";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import ControlledTextInput from "@/components/shared/Forms/ControlledTextInput";
import { useUpdateUserCartByDeviceId } from "@/apis/queries/cart.queries";
import { getLoginType, getOrCreateDeviceId } from "@/utils/helper";
import BackgroundImage from "@/public/images/before-login-bg.png";
import FacebookIcon from "@/public/images/facebook-icon.png";
import GoogleIcon from "@/public/images/google-icon.png";
import LoaderPrimaryIcon from "@/public/images/load-primary.png";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { CheckedState } from "@radix-ui/react-checkbox";
import LoaderWithMessage from "@/components/shared/LoaderWithMessage";
import { fetchUserPermissions } from "@/apis/requests/user.requests";
import { useTranslations } from "next-intl";

const formSchema = (t: any) => {
  return z.object({
    email: z
      .string()
      .trim()
      .min(5, { message: t("email_is_required") })
      .email({
        message: t("invalid_email_address"),
      })
      .refine((val) => (EMAIL_REGEX_LOWERCASE.test(val) ? true : false), {
        message: t("email_must_be_lower_case"),
      }),
    password: z
      .string()
      .trim()
      .min(2, {
        message: t("password_is_required"),
      })
      .min(8, {
        message: t("password_characters_limit_n", { n: 8 }),
      }),
  });
};

export default function LoginPage() {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const { setUser, setPermissions } = useAuth();
  const [rememberMe, setRememberMe] = useState<CheckedState>(false);

  const defaultValues = {
    email: "",
    password: "",
  };
  const form = useForm({
    resolver: zodResolver(formSchema(t)),
    defaultValues: defaultValues,
  });
  const deviceId = getOrCreateDeviceId() || "";

  const socialLogin = useSocialLogin();
  const login = useLogin();
  const updateCart = useUpdateUserCartByDeviceId();

  const onSubmit = async (values: typeof defaultValues) => {
    const response: any = await login.mutateAsync(values);

    if (response?.status && response?.accessToken) {
      // store in cookie
      // setCookie(PUREMOON_TOKEN_KEY, response.accessToken);
      if (rememberMe) {
        setCookie(PUREMOON_TOKEN_KEY, response.accessToken, {
          // 7 days
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      } else {
        setCookie(PUREMOON_TOKEN_KEY, response.accessToken, {
          // 1 days
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      // TODO: delete cart for trade role freelancer and company if logged in using device id
      // update cart
      await updateCart.mutateAsync({ deviceId });
      setUser({ id: response.data?.id, firstName: response?.data?.firstName, lastName: response?.data?.lastName, tradeRole: response?.data?.tradeRole });

      try {
        const permissions = await fetchUserPermissions();
        setPermissions([...(permissions?.data?.data?.userRoleDetail?.userRolePermission || [])]);
      } catch (e) {
      }

      toast({
        title: t("login_successful"),
        description: t("you_have_successfully_logged_in"),
        variant: "success",
      });
      form.reset();
      router.push("/home");
      return;
    }

    if (response?.status && response?.data?.status === "INACTIVE") {
      toast({
        title: t("login_in_progress"),
        description: response.message,
        variant: "success",
      });
      sessionStorage.setItem("email", values.email.toLowerCase());
      form.reset();
      router.push("/otp-verify");
      return;
    }

    toast({
      title: t("login_failed"),
      description: response.message,
      variant: "danger",
    });
  };

  const handleSocialLogin = async (userData: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  }) => {
    if (!userData?.email) return;

    const response = await socialLogin.mutateAsync({
      firstName: userData.name?.split(" ")[0] || "User",
      lastName: userData.name?.split(" ")[1] || "",
      email: userData.email,
      tradeRole: "BUYER",
      loginType: getLoginType() || "GOOGLE",
    });
    if (response?.status && response?.data) {
      toast({
        title: t("login_successful"),
        description: t("you_have_successfully_logged_in"),
        variant: "success",
      });
      setCookie(PUREMOON_TOKEN_KEY, response.accessToken);

      // TODO: delete cart for trade role freelancer and company if logged in using device id
      // update cart
      await updateCart.mutateAsync({ deviceId });
      form.reset();
      localStorage.removeItem("loginType");
      router.push("/home");
    } else {
      toast({
        title: t("login_failed"),
        description: response?.message,
        variant: "danger",
      });
      const data = await signOut({
        redirect: false,
        callbackUrl: "/login",
      });

      router.push(data.url);
    }
  };

  useEffect(() => {
    if (session && session?.user) {
      if (session?.user?.email && session?.user?.name && session?.user?.image) {
        handleSocialLogin(session.user);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <title dir={langDir} translate="no">{t("login")} | Ultrasooq</title>
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
            <div className="m-auto mb-12 w-11/12 rounded-lg border border-solid border-gray-300 bg-white p-7 shadow-sm sm:p-12 md:w-9/12 lg:w-7/12">
              <div className="text-normal m-auto mb-7 w-full text-center text-sm leading-6 text-light-gray">
                <h2 className="mb-3 text-center text-3xl font-semibold leading-8 text-color-dark sm:text-4xl sm:leading-10" dir={langDir} translate="no">
                  {t("login")}
                </h2>
                <p dir={langDir} translate="no">{t("login_to_your_account")}</p>
              </div>
              <div className="w-full">
                <Form {...form}>
                  <form
                    className="flex flex-wrap"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <ControlledTextInput
                      label={t("email_phone_id")}
                      name="email"
                      placeholder={t("enter_email_phone_id")}
                      dir={langDir}
                      translate="no"
                    />

                    <ControlledTextInput
                      label={t("password")}
                      name="password"
                      placeholder="**********"
                      type="password"
                      dir={langDir}
                      translate="no"
                    />

                    <div className="mb-4 w-full">
                      <div className="flex w-auto items-center justify-between p-0 lg:w-full">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            className="border border-solid border-gray-300 data-[state=checked]:!bg-dark-orange"
                            onCheckedChange={(val) => setRememberMe(val)}
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            dir={langDir}
                            translate="no"
                          >
                            {t("remember_me")}
                          </label>
                        </div>
                        <div className="w-auto">
                          <Link
                            className="cursor-pointer text-sm font-medium leading-8 text-dark-orange"
                            href="/forget-password"
                            dir={langDir}
                            translate="no"
                          >
                            {t("forgot_password")}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 w-full">
                      <Button
                        disabled={login.isPending}
                        type="submit"
                        className="theme-primary-btn h-12 w-full rounded bg-dark-orange text-center text-lg font-bold leading-6"
                        dir={langDir}
                        translate="no"
                      >
                        {login.isPending ? (
                          <LoaderWithMessage message={t("please_wait")} />
                        ) : (
                          t("login")
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                <div className="mb-4 w-full text-center">
                  <span className="text-sm font-medium leading-4 text-light-gray" dir={langDir} translate="no">
                    {t("dont_have_an_account")}{" "}
                    <Link
                      href="/register"
                      className="cursor-pointer font-medium text-dark-orange"
                      dir={langDir}
                    >
                      {t("signup")}
                    </Link>
                  </span>
                </div>
              </div>
              <div className="relative w-full py-5 text-center before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:block before:h-px before:w-full before:bg-gray-200 before:content-['']">
                <span className="relative z-10 bg-white p-2.5 text-sm font-normal leading-8 text-gray-400">
                  Or
                </span>
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
                      disabled={socialLogin.isPending}
                      dir={langDir}
                      translate="no"
                    >
                      {socialLogin.isPending &&
                      getLoginType() === "FACEBOOK" ? (
                        <>
                          <Image
                            src={LoaderPrimaryIcon}
                            alt="fb-icon"
                            width={20}
                            height={20}
                            className="mr-2 animate-spin"
                          />
                          <span>{t("please_wait")}</span>
                        </>
                      ) : (
                        <>
                          <Image
                            src={FacebookIcon}
                            className="mr-1.5"
                            alt="fb-icon"
                            height={26}
                            width={26}
                          />
                          <span>{t("facebook_sign_in")}</span>
                        </>
                      )}
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
                      disabled={socialLogin.isPending}
                      dir={langDir}
                      translate="no"
                    >
                      {socialLogin.isPending && getLoginType() === "GOOGLE" ? (
                        <>
                          <Image
                            src={LoaderPrimaryIcon}
                            alt="google-icon"
                            width={20}
                            height={20}
                            className="mr-2 animate-spin"
                          />
                          <span>{t("please_wait")}</span>
                        </>
                      ) : (
                        <>
                          <Image
                            src={GoogleIcon}
                            className="mr-1.5"
                            alt="google-icon"
                            height={26}
                            width={26}
                          />
                          <span>{t("google_sign_in")}</span>
                        </>
                      )}
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
