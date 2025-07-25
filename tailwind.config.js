/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["rubik-regular", "sans-serif"],
        rubikMedium: ["rubik-medium", "sans-serif"],
        rubikBold: ["rubik-bold", "sans-serif"],
        rubikExtraBold: ["rubik-extrabold", "sans-serif"],
        rubikSemiBold: ["rubik-semibold", "sans-serif"],
        rubikLight: ["rubik-light", "sans-serif"],
      },
      colors: {
        primary: "#166FFF",
        white: "#FFFFFF",
        grayText: "#636364",
        textBlack: "#000000",
        backgroundBlack: "#000000",
      },
    },
  },
  plugins: [],
};
