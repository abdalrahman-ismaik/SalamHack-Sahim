/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["var(--font-arabic)", "sans-serif"],
        latin: ["var(--font-latin)", "sans-serif"],
      },
      colors: {
        green: {
          traffic: "#16a34a",
        },
        yellow: {
          traffic: "#ca8a04",
        },
        red: {
          traffic: "#dc2626",
        },
      },
    },
  },
  plugins: [
    // RTL support
    require("tailwindcss-rtl"),
  ],
};

module.exports = config;
