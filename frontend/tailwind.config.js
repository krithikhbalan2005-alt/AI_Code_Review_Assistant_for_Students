/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030408',
          900: '#070913',
          800: '#0f1123',
          700: '#1a1d36',
          600: '#272c4e',
        },
        brand: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
