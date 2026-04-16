/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#B8E6EC',
          'cyan-deep': '#7cc8d4',
          rose: '#F4B7B8',
          'rose-deep': '#e8989a',
        },
      },
    },
  },
  plugins: [],
}
