import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6fb",
          100: "#e6ecf6",
          200: "#c8d4e9",
          300: "#9bb0d4",
          400: "#6884b9",
          500: "#4665a0",
          600: "#344e84",
          700: "#2b3f6a",
          800: "#1f2d4d",
          900: "#141c33",
          950: "#0a0f1f",
        },
        paper: {
          50: "#fdfbf6",
          100: "#f8f3e7",
          200: "#efe5cb",
        },
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
