/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bdo-red': '#ED1C24',
        'bdo-navy': '#003366',
        'bdo-blue': '#0066CC',
        'bdo-medium-gray': '#666666',
        'bdo-light': '#F5F5F5',
      },
      fontFamily: {
        'bdo': ['system-ui', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
