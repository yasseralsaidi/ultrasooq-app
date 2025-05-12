import { Metadata } from "next";
import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import Sidebar from "@/layout/MainLayout/Sidebar";
import Header from "@/layout/MainLayout/Header";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import SessionWrapper from "@/components/SessionWrapper";
import { cookies } from "next/headers";
import { PUREMOON_TOKEN_KEY } from "@/utils/constants";
import axios from "axios";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from "react";
import { getLocale } from "next-intl/server";
import { getUserLocale } from "@/src/services/locale";
import DisableRouteAnnouncer from "@/components/DisableRouteAnnouncer";

export const metadata: Metadata = {
  title: {
    template: "%s | Ultrasooq",
    default: "Ultrasooq",
  },
};

async function authorizeUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(PUREMOON_TOKEN_KEY);
    if (token?.value) {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token.value,
        },
      });
      return res.data;
    } else {
      return {
        status: 401,
      };
    }
  } catch (error) {
    return {
      status: 500,
    };
  }
}

async function getUserPermissions() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(PUREMOON_TOKEN_KEY);
    if (token?.value) {
      const res = await axios({
        method: "GET",
        url: `${process.env.NEXT_PUBLIC_API_URL}/user/get-perrmision`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + token.value,
        },
      });
      return res.data;
    } else {
      return {
        status: 401,
      };
    }
  } catch (error) {
    return {
      status: 500,
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await authorizeUser();

  const permissions = await getUserPermissions();

  const locale = await getLocale();

  return (
    <SessionWrapper>
      <html lang={locale}>
        <body className={`${inter.className}`}>
          {/* <DisableRouteAnnouncer /> */}
          <ReactQueryProvider>
            <AuthProvider
              user={{ id: userData?.data?.id, firstName: userData?.data?.firstName, lastName: userData?.data?.lastName, tradeRole: userData?.data?.tradeRole }}
              permissions={[...(permissions?.data?.userRoleDetail?.userRolePermission || [])]}
              locale={locale}
            >
              <SocketProvider>
                <main className="overflow-x-visible">
                  <NextIntlClientProvider>
                    <Sidebar />
                    <Header locale={locale} />
                    <NextTopLoader color="#DB2302" showSpinner={false} />
                    {children}
                    <Toaster />
                  </NextIntlClientProvider>
                </main>
              </SocketProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </body>
      </html>
    </SessionWrapper>
  );
}
