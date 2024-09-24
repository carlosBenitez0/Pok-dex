/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        'charizard-normal-orange': 'rgb(240, 128, 48)',
        'charizard-normal-green': 'rgb(104, 144, 240)',
        'charizard-shiny-black': 'rgb(54, 57, 62)',
        'charizard-shiny-red': 'rgb(240, 64, 56)',

        'metagross-normal-gray-blue': 'rgb(112, 136, 144)',
        'metagross-normal-silver': 'rgb(184, 184, 208)',
        'metagross-shiny-silver': 'rgb(240, 240, 240)',
        'metagross-shiny-gold': 'rgb(248, 208, 48)',
      },
    },
  },
  plugins: [],
};
