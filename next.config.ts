import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // @opentelemetry/api is an optional dep Next.js probes for at runtime
  // (tracing support) but its webpack chunk sometimes isn't emitted,
  // causing "Cannot find module './vendor-chunks/@opentelemetry.js'".
  // Marking it external makes Next resolve it via plain require() instead.
  serverExternalPackages: ["@opentelemetry/api"],
  webpack: (config) => {
    // Work around a Next.js 15 ChunkNamesPlugin/splitChunks bug where
    // single-use vendor chunks get merged into the page chunk but are still
    // recorded as separate `vendor-chunks/<pkg>` dependencies. The server
    // runtime then fails with "Cannot find module './vendor-chunks/<pkg>.js'".
    // Raising the request limits forces every vendor chunk to be emitted.
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      maxInitialRequests: Infinity,
      maxAsyncRequests: Infinity,
    };
    return config;
  },
  images: {
    // Optimized image variants (webp/resized) are cached at the edge for at
    // least this long before Next re-checks the origin. Content images here
    // change rarely, so a low default TTL just means repeated re-optimization.
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
hostname: "drive.usercontent.google.com",
        pathname: "/download/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "kamrieng-highschool.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
