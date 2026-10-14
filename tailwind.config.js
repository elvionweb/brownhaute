/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: { 50: '#fbf7f1', 100: '#f7f0e6', 200: '#eee2d0', 300: '#e0cdb0' },
        cocoa: { 950: '#1d110c', 900: '#2b1b14', 800: '#3c261b', 700: '#523325', 600: '#6b4634' },
        gold: { 300: '#e6c88e', 400: '#d4ab66', 500: '#b88a44', 600: '#97702f' },
        clay: { 500: '#b5603f', 600: '#984a2d' },
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: 0.55 }, '100%': { transform: 'scale(1.7)', opacity: 0 } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        pulseRing: 'pulseRing 2s ease-out infinite',
        spinSlow: 'spinSlow 22s linear infinite',
        bob: 'bob 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
