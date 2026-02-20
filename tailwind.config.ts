import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#faf7f2",
        panel: "rgba(255,253,248,0.97)",
        border: "rgba(26,77,46,0.12)",
        blue: "#1a4d2e",
        cyan: "#84cc16",
        purple: "#8b6f47",
        orange: "#c4783e",
        muted: "#8b8178",
        text: "#2d2a26",
      },
      fontFamily: {
        display: ["var(--font-outfit)", "Arial", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
