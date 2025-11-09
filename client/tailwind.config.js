/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 360ms ease both',
      },
      colors: {
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6'
        }
      }
    },
  },
  plugins: [],
};
