"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

// The `lang` attribute on <html> is set once by the root server layout,
// which Next.js does not re-render on a client-side locale switch (only
// the nested [locale] layout/page re-render). Without this, :lang(km)
// CSS rules (e.g. the Battambang font) stay stuck on the previous
// locale until a full page reload.
export default function LocaleHtmlSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
