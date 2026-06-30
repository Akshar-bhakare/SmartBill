/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F5EF',
        foreground: '#111111',
        brand: {
          purple: '#6C3BFF',
          green: '#C7FF32',
          yellow: '#FFD84D',
          coral: '#FF7A70',
          cyan: '#8EE8E3',
          dark: '#111111',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0px #111111',
        'brutal-md': '5px 5px 0px #111111',
        'brutal-lg': '8px 8px 0px #111111',
        'brutal-xl': '12px 12px 0px #111111',
      },
    },
  },
  plugins: [],
}
