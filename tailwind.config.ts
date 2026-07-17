import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211F36",
        paper: "#F7F6FB",
        surface: "#FFFFFF",
        line: "#E4E2EF",
        text: "#211F36",
        muted: "#716F87",
        brand: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#EEF2FF",
        },
        occupied: {
          DEFAULT: "#F43F5E",
          light: "#FFE4E8",
        },
        warn: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        // Couleurs par type de ressource — badges/icônes sur la page resources
        resource: {
          room: "#10B981",       // salle — émeraude (à confirmer)
          desk: "#2DD4BF",       // bureau — turquoise
          parking: "#F59E0B",    // parking — ambre
          vehicle: "#EC4899",    // véhicule — rose
          equipment: "#64748B",  // matériel — ardoise
          printer: "#38BDF8",    // imprimante — bleu ciel
          tv: "#8B5CF6",         // télé — violet
          projector: "#F97316",  // projecteur — orange
          other: "#A8998B",      // autre — taupe
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
