"use client";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useChangeEmail } from "@/apis/queries/auth.queries";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { EMAIL_REGEX_LOWERCASE } from "@/utils/constants";
import BackgroundImage from "@/public/images/before-login-bg.png";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

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
  });
};

export default function ChangeEmailPage() {
  const t = useTranslations();
  const { langDir } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      email: "",
    },
  });
  const changeEmail = useChangeEmail();

  const onSubmit = async (values: any) => {
    const response = await changeEmail.mutateAsync(values);

    if (response?.status && response?.otp) {
      toast({
        title: t("verification_code_sent"),
        description: response?.message,
        variant: "success",
      });

      sessionStorage.setItem("email", values.email.toLowerCase());
      form.reset();
      router.push("/email-change-verify");
    } else {
      toast({
        title: t("verification_error"),
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
            <h2 className="mb-4  text-[18px] font-semibold md:text-[22px]" dir={langDir} translate="no">
              {t("change_email")}
            </h2>
            <div className="w-full">
              <Form {...form}>
                <form
                  className="flex flex-wrap"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mb-4 w-full" dir={langDir}>
                        <FormLabel translate="no">{t("new_email")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("enter_email")}
                            className="!h-12 rounded border-gray-300 focus-visible:!ring-0"
                            {...field}
                            dir={langDir}
                            translate="no"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-full">
                    <Button
                      disabled={changeEmail.isPending}
                      type="submit"
                      className="h-12 w-full rounded bg-dark-orange text-center text-base font-bold leading-6 text-white hover:bg-dark-orange hover:opacity-90 md:text-lg"
                      translate="no"
                    >
                      {changeEmail.isPending ? (
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
                        t("change_email")
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
