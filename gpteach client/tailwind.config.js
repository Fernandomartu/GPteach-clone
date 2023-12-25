/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-50": "#A0C6CE",
        "secondary-50": "#FFFFFF",
        "tertiary-50": "#04B4A6",
        "standard-50": "#000000",
      },
      fontFamily: {
        sans: ["Roboto Mono", "sans-serif"],
      },
    },
    screens: {
      xs: "480px",
      sm: "768px",
      md: "1060px",
      lg: "1600px",
    },
  },
  plugins: [],
};
