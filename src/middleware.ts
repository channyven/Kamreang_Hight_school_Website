import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale } from "@/i18n/config";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { ADMIN_PATH } from "@/lib/admin-path";

const intlMiddleware = createMiddleware(routing);

/**
 * Regex that matches the **obfuscated** admin URL segment.
 * Example match: /en/9f3c1b28-7d91-4e52-8f5d-admin/users
 */
const OBFUSCATED_ADMIN = new RegExp(
  `^\\/[a-z]{2}\\/${ADMIN_PATH}(\\/.*)?$`
);

/**
 * Regex that matches the **real** /admin path used internally by the
 * file-system router.  The middleware returns a 404 for these so that
 * automated scanners cannot discover the control panel.
 */
const DIRECT_ADMIN = /^\/[a-z]{2}\/admin(\/.*)?$/;

const LOGIN_PATH = /^\/[a-z]{2}\/login(\/.*)?$/;

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = (pathname.split("/")[1] ?? defaultLocale) as string;

  // ── 1. Block direct /admin access ─────────────────────
  // Return a plain 404 so scanners see nothing at the expected path.
  if (DIRECT_ADMIN.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // ── 2. Handle the obfuscated admin path ────────────────
  //   a) Check the session cookie → redirect to login if absent.
  //   b) Rewrite the URL internally so Next.js renders the real
  //      file-system route under /admin/…. The browser address bar
  //      keeps the obfuscated path.
  if (OBFUSCATED_ADMIN.test(pathname)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rewrite internally to the real route — browser keeps seeing
    // the obfuscated URL.
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(ADMIN_PATH, "admin");
    return NextResponse.rewrite(url);
  }

  // ── 3. Run next-intl middleware (locale detection / redirect) ─
  const response = intlMiddleware(request);

  // ── 4. Redirect authenticated users away from /login ─────────
  if (LOGIN_PATH.test(pathname)) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      return NextResponse.redirect(
        new URL(`/${locale}/${ADMIN_PATH}`, request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static assets and API
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
