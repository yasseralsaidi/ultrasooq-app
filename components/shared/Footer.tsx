"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import TermsContent from "./TermsContent";
import PolicyContent from "./PolicyContent";
import { Button } from "../ui/button";
import Image from "next/image";
import AllCardsImage from "@/public/images/all-card.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EMAIL_REGEX_LOWERCASE } from "@/utils/constants";
import ControlledTextInput from "./Forms/ControlledTextInput";
import { Form } from "../ui/form";
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

const defaultValues = {
  email: "",
};

const Footer = () => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema(t)),
    defaultValues,
  });

  const handleToggleTermsModal = () => setIsTermsModalOpen(!isTermsModalOpen);
  const handleTogglePrivacyModal = () =>
    setIsPrivacyModalOpen(!isPrivacyModalOpen);

  const onSubmit = (data: typeof defaultValues) => {
    console.log(data);
  };

  return (
    <footer className="w-full pt-6 md:pt-16">
      <div className="container m-auto">
        <div className="flex flex-wrap">
          <div className="mb-5 w-full px-3.5 sm:w-6/12 md:w-3/12 lg:w-3/12">
            <h3
              className="mb-2 text-lg font-semibold capitalize text-color-dark md:mb-3.5"
              translate="no"
            >
              {t("quick_links")}
            </h3>
            <ul>
              <li className="w-full py-1.5">
                <Button
                  variant="link"
                  onClick={handleTogglePrivacyModal}
                  className="p-0 text-base font-normal text-light-gray"
                  dir={langDir}
                  translate="no"
                >
                  {t("policy")}
                </Button>
              </li>
              <li className="w-full py-1.5">
                <Button
                  variant="link"
                  onClick={handleToggleTermsModal}
                  className="p-0 text-base font-normal text-light-gray"
                  translate="no"
                >
                  {t("term_n_condition")}
                </Button>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("shipping")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("return")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("faqs")}
                </a>
              </li>
            </ul>
          </div>
          <div className="mb-5 w-full px-3.5 sm:w-6/12 md:w-2/12 lg:w-3/12">
            <h3
              className="mb-2 text-lg font-semibold capitalize text-color-dark md:mb-3.5"
              translate="no"
            >
              {t("company")}
            </h3>
            <ul>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("about_us")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("affiliate")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("career")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("contact")}
                </a>
              </li>
            </ul>
          </div>
          <div className="mb-5 w-full px-3.5 sm:w-6/12 md:w-2/12 lg:w-2/12">
            <h3
              className="mb-2 text-lg font-semibold capitalize text-color-dark md:mb-3.5"
              translate="no"
            >
              {t("business")}
            </h3>
            <ul>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("our_press")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("checkout")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("my_account")}
                </a>
              </li>
              <li className="w-full py-1.5 text-base font-normal capitalize text-light-gray">
                <a href="#" className="text-light-gray" translate="no">
                  {t("shop")}
                </a>
              </li>
            </ul>
          </div>
          <div className="mb-5 w-full px-3.5 sm:w-6/12 md:w-5/12 lg:w-4/12">
            <h3
              className="mb-2 text-lg font-semibold capitalize text-color-dark md:mb-3.5"
              dir={langDir}
              translate="no"
            >
              {t("newsletter")}
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-3 flex w-full"
              >
                <div className="w-3/4">
                  <ControlledTextInput
                    name="email"
                    placeholder={t("email_address")}
                    dir={langDir}
                    translate="no"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 h-12 w-1/4 rounded-r border border-solid border-dark-orange bg-dark-orange text-xs font-medium text-white md:text-sm"
                  dir={langDir}
                  translate="no"
                >
                  {t("subscribe")}
                </button>
              </form>
            </Form>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="flex w-full flex-wrap items-center justify-center border-t border-solid border-gray-200 px-3 py-5 md:px-0 lg:justify-between">
            <div className="mb-3 flex w-auto items-center justify-start text-base font-normal capitalize text-light-gray lg:mb-0">
              <p dir={langDir} translate="no">
                ©2021 Ultrasooq {t("all_rights_reserved")}
              </p>
            </div>
            <div className="flex w-auto flex-wrap items-center justify-center text-base font-normal capitalize text-light-gray lg:justify-end">
              <p
                className="w-full text-center sm:w-auto"
                dir={langDir}
                translate="no"
              >
                {t("payment_info")}:
              </p>
              <Image
                src={AllCardsImage}
                className="mt-3 sm:ml-3 sm:mt-0"
                alt="all-card-banner"
                width={383}
                height={33}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isTermsModalOpen} onOpenChange={handleToggleTermsModal}>
        <DialogContent className="md:!max-w-4xl">
          <DialogHeader className="border-b border-light-gray pb-3">
            <DialogTitle className="text-center" dir={langDir} translate="no">
              {t("terms_of_use")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="max-h-[500px] min-h-[300px] overflow-y-auto pr-2 text-sm font-normal leading-7 text-color-dark">
            <TermsContent />
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrivacyModalOpen} onOpenChange={handleTogglePrivacyModal}>
        <DialogContent className="md:!max-w-4xl">
          <DialogHeader className="border-b border-light-gray pb-3">
            <DialogTitle className="text-center" dir={langDir} translate="no">
              {t("privacy_policy")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="max-h-[500px] min-h-[300px] overflow-y-auto pr-2 text-sm font-normal leading-7 text-color-dark">
            <PolicyContent />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
