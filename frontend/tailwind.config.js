/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#f43f5e',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
          DEFAULT: '#e11d48',
          light: '#f43f5e',
          neon: '#f43f5e',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#f43f5e',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
        },
      },
      borderColor: {
        hairline: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
      },
      fontFamily: {
        sans: ["'Google Sans'", "'Product Sans'", "'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        cursive: ["'Alex Brush'", "'Playfair Display'", "cursive", "serif"],
      },
    },
  },
  plugins: [],
}
