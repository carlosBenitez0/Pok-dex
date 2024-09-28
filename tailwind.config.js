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
        "charizard-normal-orange": "rgb(240, 128, 48)",
        "charizard-normal-green": "rgb(104, 144, 240)",
        "charizard-shiny-black": "rgb(54, 57, 62)",
        "charizard-shiny-red": "rgb(240, 64, 56)",

        "metagross-normal-gray-blue": "rgb(112, 136, 144)",
        "metagross-normal-silver": "rgb(184, 184, 208)",
        "metagross-shiny-silver": "rgb(240, 240, 240)",
        "metagross-shiny-gold": "rgb(248, 208, 48)",
      },
      textShadow: {
        sm: "1px 1px 2px rgba(0, 0, 0, 0.25)",
        md: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        lg: "3px 3px 6px rgba(0, 0, 0, 0.35)",
        xl: "4px 4px 8px rgba(0, 0, 0, 0.45)",
        button_pressed_shadow:
          "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-shadow-sm": {
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.25)",
        },
        ".text-shadow-md": {
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.25)",
        },
        ".text-shadow-lg": {
          textShadow: "3px 3px 6px rgba(0, 0, 0, 0.35)",
        },
        ".text-shadow-xl": {
          textShadow: "4px 4px 8px rgba(0, 0, 0, 0.45)",
        },
        ".text-shadow-none": {
          textShadow: "none",
        },
        ".shadow-button-pressed": {
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
