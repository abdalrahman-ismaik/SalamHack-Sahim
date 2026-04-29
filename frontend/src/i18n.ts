import { getRequestConfig } from "next-intl/server";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && locales.includes(requested as (typeof locales)[number])
    ? requested
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
