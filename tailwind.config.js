/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#111827",
        ink: "#e5eef7",
        accent: "#f97316",
        accentSoft: "#fed7aa"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 18px 60px rgba(15, 23, 42, 0.28)"
      }
    }
  },
  plugins: []
};
