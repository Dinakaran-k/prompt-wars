/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#f0f9fb',
          100: '#daf1f5',
          200: '#b8e3ea',
          300: '#8ccdda',
          400: '#57adc0',
          500: '#3a8fa3',
          600: '#2f7386',
          700: '#2a5e6e',
          800: '#274e5b',
          900: '#24424e',
          950: '#122a34',
        },
        sand: {
          50: '#fdfaf6',
          100: '#f8f1e7',
          200: '#efe0cb',
          300: '#e2c8a4',
          400: '#d3ab77',
          500: '#c4915a',
          600: '#a9764a',
        }
      },
    },
  },
  plugins: [],
}
