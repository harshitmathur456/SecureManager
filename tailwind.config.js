/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: "#070a10",
          base: "#0f131d",
          card: "#161c2a",
          cardHover: "#1d2538",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          blue: "#74a2ff",
          mint: "#6ffbbe",
          amber: "#ffd066",
          red: "#ffb4ab",
          purple: "#d0bcff",
        },
      },
      fontFamily: {
        sans: ["var(--font-mona-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
