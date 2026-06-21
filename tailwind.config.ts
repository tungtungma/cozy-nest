import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F2",
        foreground: "#2B2522",
        cream: "#F4EDE3",
        "cream-deep": "#EAD9C5",
        muted: "#EFE7DB",
        "muted-foreground": "#8B7E72",
        accent: "#B88A5E",
        border: "#E6DCCD",
        // Keep previous palette for backward compatibility
        charcoal: {
          DEFAULT: "#2D2D2D",
          soft: "#4A4A4A",
        },
        brown: {
          DEFAULT: "#8B7355",
          light: "#C4A882",
          dark: "#6B5340",
          deep: "#4A3828",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        oval: "50% / 45%",
      },
    },
  },
  plugins: [],
};

export default config;
