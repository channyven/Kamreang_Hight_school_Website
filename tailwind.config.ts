import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // School brand colors — official palette (Brand Color Style Guide, Jul 2026)
        // Navy #2C2A7A (Primary), Gold #DFAD32 (Accent), Gray #D8D8D8, Green #72B944 (optional accent)
        school: {
          navy: "hsl(var(--school-navy))",
          goldMain: "hsl(var(--school-gold-main))",
          blue: {
            50: "#f8f7fc",
            100: "#f4f4fb",
            200: "#d7d6f1",
            300: "#adace2",
            400: "#817fd3",
            500: "#5451c3",
            600: "#3e3bab",
            700: "#343291",
            800: "#2c2a7a",
            900: "#242263",
            950: "#191845",
            DEFAULT: "#2c2a7a",
          },
          gold: {
            50: "#fefbf6",
            100: "#fdf9f0",
            200: "#f7ebcc",
            300: "#f0d79c",
            400: "#e7c267",
            500: "#dfad32",
            600: "#c4951f",
            700: "#a67d1a",
            800: "#8b6916",
            900: "#715512",
            950: "#4d3a0c",
            DEFAULT: "#dfad32",
          },
          gray: {
            50: "#fafafa",
            100: "#fafafa",
            200: "#f4f4f4",
            300: "#d8d8d8",
            400: "#b9b9b9",
            500: "#9b9b9b",
            600: "#848484",
            700: "#727272",
            800: "#636363",
            900: "#535353",
            950: "#3f3f3f",
            DEFAULT: "#d8d8d8",
          },
          green: {
            50: "#f5faf2",
            100: "#eaf5e3",
            200: "#d4eac6",
            300: "#b5db9d",
            400: "#93ca70",
            500: "#72b944",
            600: "#5d9738",
            700: "#4d7d2e",
            800: "#3f6726",
            900: "#32511e",
            950: "#1f3313",
            DEFAULT: "#72b944",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        khmer: ["var(--font-battambang)", "Battambang", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "counter-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "counter-up": "counter-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [typography, aspectRatio],
};

export default config;
