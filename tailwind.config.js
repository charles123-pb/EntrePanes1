/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  // Importante: no purgar clases de Angular Material
  important: true,
  theme: {
    extend: {
      colors: {
        // Paleta Entre Panes — Oscuro cálido
        stone: {
          850: '#1c1917',
          950: '#0c0a09',
        },
        brand: {
          amber:   '#f59e0b',
          orange:  '#f97316',
          red:     '#ef4444',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"',    'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
};
