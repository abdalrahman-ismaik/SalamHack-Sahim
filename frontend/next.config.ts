import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  // Output for Netlify
  output: "standalone",
  experimental: {
    // Enable server components
  },
};

export default withNextIntl(nextConfig);
