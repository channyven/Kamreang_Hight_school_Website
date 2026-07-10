import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";
import { locales } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const { data: news } = await supabase
    .from("news")
    .select("slug, updated_at")
    .eq("status", "published");

  const staticRoutes = [
    "",
    "/news",
    "/achievements",
    "/contact",
    "/about",
    "/research",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : ("weekly" as const),
      priority: route === "" ? 1 : 0.8,
    }))
  );

  const newsEntries: MetadataRoute.Sitemap = (news ?? []).flatMap((n) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/news/${n.slug}`,
      lastModified: n.updated_at ? new Date(n.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...newsEntries];
}
