import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUREMOON_TOKEN_KEY } from "./utils/constants";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get(PUREMOON_TOKEN_KEY)?.value;
  const publicPaths = [
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
    "/password-reset-verify",
    "/otp-verify",
  ];

  const globalPaths = [
    "/home",
    "/trending",
    "/trending/:id",
    "/cart",
    "/orders",
    "/rfq",
  ];

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const dynamicPathRegex = /^\/trending\/\d+$/;

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return authToken
      ? NextResponse.redirect(new URL("/home", request.url))
      : NextResponse.next();
  }

  if (authToken) {
    return publicPaths.includes(request.nextUrl.pathname)
      ? NextResponse.redirect(new URL("/home", request.url))
      : NextResponse.next();
  } else {
    return globalPaths.includes(request.nextUrl.pathname) ||
      dynamicPathRegex.test(request.nextUrl.pathname)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
