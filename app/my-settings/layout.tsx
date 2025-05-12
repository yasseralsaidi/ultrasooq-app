"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import PackageIcon from "@/components/icons/PackageIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import UserIcon from "@/components/icons/UserIcon";
import { useMe } from "@/apis/queries/user.queries";
import Link from "next/link";
import { getInitials } from "@/utils/helper";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const MySettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations();
  const { langDir } = useAuth();
  const pathname = usePathname();
  const isActivePath = (path: string) => path === pathname;

  const me = useMe();
  const memoizedInitials = useMemo(
    () => getInitials(me.data?.data?.firstName, me.data?.data?.lastName),
    [me.data?.data?.firstName, me.data?.data?.lastName],
  );

  return (
    <div className="my-settings-page">
      <div className="container m-auto px-3">
        <div className="my-settings-page-wrapper">
          <div className="my-settings-panel">
            <div className="card-item">
              <figure className="userInfo">
                <div className="image-container">
                  {me?.data?.data?.profilePicture ? (
                    <Image
                      alt="image-icon"
                      src={me?.data?.data?.profilePicture}
                      height={44}
                      width={44}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-[44px] w-[44px] rounded-full bg-gray-300">
                      <p className="p-2 text-lg font-bold">
                        {memoizedInitials}
                      </p>
                    </div>
                  )}
                </div>
                <figcaption>
                  <h5>Hello,</h5>
                  <h4>
                    {me.data?.data?.firstName} {me.data?.data?.lastName}
                  </h4>
                </figcaption>
              </figure>
            </div>
            <div className="card-item">
              <ul className="menu-lists" dir={langDir}>
                <li>
                  <Link href="/my-orders" className="menu-links">
                    <span className="icon-container">
                      <PackageIcon />
                    </span>
                    <span className="text-container" translate="no">{t("my_orders")}</span>
                    {/* TODO: commented for now */}
                    {/* <span className="arow">
                      <ChevronDownIcon />
                    </span> */}
                  </Link>
                </li>
                <li>
                  <a href="" className="menu-links active">
                    <span className="icon-container">
                      <UserIcon />
                    </span>
                    <span className="text-container" translate="no">{t("account_settings")}</span>
                    <span className="arow">
                      <ChevronDownIcon />
                    </span>
                  </a>
                  <div className="sub-menu-ul">
                    <div className="sub-menu-li">
                      <Link
                        href="/my-settings/address"
                        className={cn(
                          "sub-menu-links",
                          isActivePath("/my-settings/address") ? "active" : "",
                        )}
                        translate="no"
                      >
                        {t("manage_address")}
                      </Link>
                    </div>
                    {me.data?.data?.loginType === "MANUAL" ? (
                      <>
                        <div className="sub-menu-li">
                          <Link
                            href="/my-settings/change-password"
                            className={cn(
                              "sub-menu-links",
                              isActivePath("/my-settings/change-password")
                                ? "active"
                                : "",
                            )}
                            translate="no"
                          >
                            {t("change_password")}
                          </Link>
                        </div>
                        <div className="sub-menu-li">
                          <Link
                            href="/my-settings/change-email"
                            className={cn(
                              "sub-menu-links",
                              isActivePath("/my-settings/change-email")
                                ? "active"
                                : "",
                            )}
                            translate="no"
                          >
                            {t("change_email")}
                          </Link>
                        </div>
                      </>
                    ) : null}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MySettingsLayout;
