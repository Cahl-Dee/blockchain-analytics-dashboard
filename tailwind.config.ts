import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Catch all src files
  ],
  darkMode: "media", // or 'class' if you want manual control
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          50: "#f0f5ff",
          100: "#e5edff",
          200: "#cddbfe",
          300: "#b4c6fc",
          400: "#8da9f8",
          500: "#6684f3",
          600: "#4f64e7",
          700: "#3f4fd1",
          800: "#3544ab",
          900: "#2d3a8c",
          950: "#1c2452",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
