/**
 * Security-by-obscurity admin path constant.
 *
 * All admin routes use this obfuscated prefix instead of "/admin"
 * so that casual attackers scanning for common paths will not find
 * the admin panel.  The middleware rewrites this URL segment back to
 * the real file-system route internally.
 *
 * Change this value to rotate the admin path at any time — all links
 * will pick it up automatically.
 */
export const ADMIN_PATH = "9f3c1b28-7d91-4e52-8f5d-admin";

/**
 * Build a fully qualified admin link for the given locale.
 *
 * @example
 *   adminHref("en")           // "/en/9f3c1b28-7d91-4e52-8f5d-admin"
 *   adminHref("km", "users")  // "/km/9f3c1b28-7d91-4e52-8f5d-admin/users"
 *   adminHref("en", "news/new") // "/en/9f3c1b28-7d91-4e52-8f5d-admin/news/new"
 */
export function adminHref(locale: string, subpath = ""): string {
  if (subpath) return `/${locale}/${ADMIN_PATH}/${subpath.replace(/^\//, "")}`;
  return `/${locale}/${ADMIN_PATH}`;
}
