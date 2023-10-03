/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  variants: {
    extend: {
      backgroundColor: ["even"]
    }
  },
  theme: {
    extend: {
      colors: {
        primary: "#5256b8",
        secondary: "#9747FF",
        "light-primary": "#98A3EB",
        input: "#F4F3F8",
        dark: "#565B6B",
        red: "#a22c2c",
        "chart-green": "#5AB281",
        "chart-purple": "#5256B8",
        "chart-red": "#EB6C64",
        "chart-blue": "#63A4E9",
        "chart-yellow": "#F5C266",
        yellow: "#faf9d7",
        grey: "#f0f0f0"
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        md: "14px",
        lg: "16px",
        lx: "18px",
        ll: "22px",
        xl: "24px"
      }
    }
  },
  plugins: [require("daisyui")]
};
