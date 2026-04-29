import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep standalone for production deployments, but avoid dev vendor-chunk issues.
  output: isDev ? undefined : "standalone",
  experimental: {
    // Enable server components
  },
};

export default withNextIntl(nextConfig);
