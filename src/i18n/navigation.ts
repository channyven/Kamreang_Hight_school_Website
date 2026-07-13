import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware navigation APIs. Prefer these over next/link and
// next/navigation in app code so the locale prefix is handled
// automatically instead of building `/${locale}/...` paths by hand.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
