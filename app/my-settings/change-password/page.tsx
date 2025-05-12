"use client";
import { useChangePassword } from "@/apis/queries/auth.queries";
import PasswordChangeSuccessContent from "@/components/shared/PasswordChangeSuccessContent";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BackgroundImage from "@/public/images/before-login-bg.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const formSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(2, {
        message: "Old Password is required",
      })
      .min(8, {
        message: "Password must be longer than or equal to 8 characters",
      }),
    newPassword: z
      .string()
      .trim()
      .min(2, {
        message: "New Password is required",
      })
      .min(8, {
        message: "Password must be longer than or equal to 8 characters",
      }),
    confirmPassword: z
      .string()
      .trim()
      .min(2, {
        message: "Password is required",
      })
      .min(8, {
        message: "Password must be longer than or equal to 8 characters",
      }),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export default function ChangePasswordPage() {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const changePassword = useChangePassword();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await changePassword.mutateAsync(values, {
      onError: (err) => {
        toast({
          title: t("password_change_failed"),
          description: err?.response?.data?.message,
          variant: "danger",
        });
        form.reset();
        deleteCookie(PUREMOON_TOKEN_KEY);
      },
    });

    if (response?.status && response?.data) {
      toast({
        title: t("password_change_successful"),
        description: response?.message,
        variant: "success",
      });
      form.reset();
      deleteCookie(PUREMOON_TOKEN_KEY);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/home");
        setShowSuccess(false);
      }, 3000);
    } else {
      toast({
        title: t("password_change_failed"),
        description: response?.message,
        variant: "danger",
      });
    }
  };

  return (
    <section className="relative w-full">
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
          <div className="w-full rounded-lg border border-solid border-gray-300 bg-white p-4 shadow-sm">
            {showSuccess ? (
              <div className="px-4 py-6">
                <PasswordChangeSuccessContent />
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-[18px] font-semibold md:text-[22px]" dir={langDir} translate="no">
                  {t("change_password")}
                </h2>
                <div className="w-full">
                  <Form {...form}>
                    <form
                      className="flex flex-wrap"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="mb-4 w-full" dir={langDir}>
                            <FormLabel translate="no">{t("old_password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="**********"
                                className="!h-12 rounded border-gray-300 focus-visible:!ring-0"
                                {...field}
                                dir={langDir}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="mb-4 w-full" dir={langDir}>
                            <FormLabel translate="no">{t("new_password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="**********"
                                className="!h-12 rounded border-gray-300 focus-visible:!ring-0"
                                {...field}
                                dir={langDir}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="mb-4 w-full" dir={langDir}>
                            <FormLabel translate="no">{t("reenter_new_password")}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="**********"
                                className="!h-12 rounded border-gray-300 focus-visible:!ring-0"
                                {...field}
                                dir={langDir}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="w-full">
                        <Button
                          disabled={changePassword.isPending}
                          type="submit"
                          className="h-12 w-full rounded bg-dark-orange text-center text-base font-bold leading-6 text-white hover:bg-dark-orange hover:opacity-90 md:text-lg"
                          translate="no"
                        >
                          {changePassword.isPending ? (
                            <>
                              <Image
                                src="/images/load.png"
                                alt="loader-icon"
                                width={20}
                                height={20}
                                className="mr-2 animate-spin"
                              />
                              {t("please_wait")}
                            </>
                          ) : (
                            t("change_password")
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
