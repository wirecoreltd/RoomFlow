import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14181F",
        paper: "#F7F6F2",
        surface: "#FFFFFF",
        line: "#E4E1D8",
        text: "#1B1F23",
        muted: "#767065",
        brand: {
          DEFAULT: "#0E7C7B",
          dark: "#0A5F5E",
          light: "#E4F3F1",
        },
        occupied: {
          DEFAULT: "#C24914",
          light: "#FBE9DF",
        },
        warn: {
          DEFAULT: "#D9A441",
          light: "#FBF1DE",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-public-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
