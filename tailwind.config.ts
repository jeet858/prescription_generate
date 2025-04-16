import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
    screens: {
      xl2: { max: "1299px" },
      laptop: "1024px",
      tablet: { max: "820px", min: "768px" },
      desktop: "1280px",
    },
  },
  plugins: [],
} satisfies Config;
