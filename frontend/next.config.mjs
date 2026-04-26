import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output for Netlify
  output: "standalone",
  experimental: {
    // Enable server components
  },
};

export default withNextIntl(nextConfig);
