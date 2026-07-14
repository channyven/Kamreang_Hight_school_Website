import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
        hostname: "i.pinimg.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
