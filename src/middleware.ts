import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const ADMIN_PATH = /^\/[a-z]{2}\/admin(\/.*)?$/;
const AUTH_PATH = /^\/[a-z]{2}\/auth(\/.*)?$/;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run next-intl middleware first for locale detection
  const response = intlMiddleware(request);

  // Protect admin routes — check for session cookie set after Firebase login
  if (ADMIN_PATH.test(pathname)) {
    const sessionCookie = request.cookies.get("__session");

    if (!sessionCookie?.value) {
      const locale = pathname.split("/")[1] ?? defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATH.test(pathname)) {
    const sessionCookie = request.cookies.get("__session");
    if (sessionCookie?.value) {
      const locale = pathname.split("/")[1] ?? defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
