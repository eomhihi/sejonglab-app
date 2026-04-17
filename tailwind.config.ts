import type { Config } from "tailwindcss";

/**
 * [OLD] Tailwind 색상 원복 참고 (globals.css :root 주석과 함께)
 * - sejong: { blue: "#004B8D", "blue-light": "#0066B3", "blue-dark": "#003666" }
 * - primary: { 500: "#004B8D", … 기존 스케일 }
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--foreground)",
        "header-footer": "var(--color-header-footer)",
        primary: {
          50: "#f4f7f8",
          100: "#e9eef0",
          200: "#d3dde2",
          300: "#adbec7",
          400: "#6d8e9e",
          500: "var(--color-primary)",
          600: "#0f3b4a",
          700: "#0c303c",
          800: "#09242e",
          900: "#061920",
          950: "#030f14",
        },
        oxford: "#1d3557",
        sejong: {
          blue: "var(--color-primary)",
          "blue-light": "var(--color-secondary)",
          "blue-dark": "#0c303c",
        },
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        mint: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        ticker: "ticker 30s linear infinite",
        "ticker-vertical": "ticker-vertical 20s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ticker-vertical": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
