// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Ensure this line matches
  ],
  theme: {
    extend: {
      fontFamily: { // Add Poppins font
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}