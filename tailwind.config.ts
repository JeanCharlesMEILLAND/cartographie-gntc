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
        bg: "#f5f6fa",
        panel: "rgba(255,255,255,0.97)",
        border: "rgba(88,123,189,0.15)",
        blue: "#587bbd",
        cyan: "#7dc243",
        purple: "#8b6db5",
        orange: "#e08a2e",
        muted: "#8893a7",
        text: "#2b2b2b",
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
