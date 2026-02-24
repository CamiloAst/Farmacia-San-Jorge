/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        institutional: {
          light: '#e8f5e9', // very light green
          DEFAULT: '#4caf50', // primary green
          dark: '#388e3c', // dark green
        },
      }
    },
  },
  plugins: [],
}
