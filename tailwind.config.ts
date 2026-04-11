import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          purple: "#7f5af0",
          dark: "#111111",
          card: "#16161a",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
