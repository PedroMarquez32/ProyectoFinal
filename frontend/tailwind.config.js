/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4DA8DA',
        secondary: '#3a3a3c',
        background: '#f6e7d7',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 