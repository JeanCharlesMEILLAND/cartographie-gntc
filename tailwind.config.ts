import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#060a14",
        panel: "rgba(8,14,30,0.95)",
        border: "rgba(70,120,255,0.1)",
        blue: "#5b9aff",
        cyan: "#38d9f5",
        purple: "#a78bfa",
        orange: "#f59e42",
        muted: "#5e6d8f",
        text: "#d6ddf0",
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
