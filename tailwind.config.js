 /** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
   theme: {
     extend: {
      colors: {
        gray: {
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
          300: "#D1D5DB"
        }
      }
     },
   },
   plugins: [],
 }