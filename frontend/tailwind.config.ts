import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        // Deep industrial navy — not pure black, holds detail like a factory floor at night
        base: {
          950: "#05070B",
          900: "#0A0E14",
          800: "#0F141C",
          700: "#161D28",
          600: "#212A38",
        },
        steel: {
          400: "#94A3B3",
          300: "#B7C0CB",
        },
        cyan: {
          accent: "#3FC6E0", // restrained, desaturated — not neon
          dim: "#2A8FA6",
        },
        status: {
          good: "#34D399",
          warn: "#F2B84B",
        },
        hairline: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-plex-sans)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-blueprint":
          "linear-gradient(rgba(63,198,224,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(63,198,224,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(63,198,224,0.15), 0 0 24px 0 rgba(63,198,224,0.08)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 200%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
