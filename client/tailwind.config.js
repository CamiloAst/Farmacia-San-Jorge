/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        corporate: {
          light: '#f8fafc', // slate-50 background look
          DEFAULT: '#2563eb', // blue-600 for accents
          dark: '#172554', // blue-950 for structures/headers
        },
      }
    },
  },
  plugins: [],
}
