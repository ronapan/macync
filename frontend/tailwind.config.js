/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'macync-green': '#14532d',
        'macync-light': '#15803d',
      }
    },
  },
  plugins: [],
  // tailwind.config.js
  extend: {
    fontFamily: {
      poppins: ['"Poppins"', 'sans-serif'],
      openSans: ['"Open Sans"', 'sans-serif'],
    },
},
}

