/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: '#07090e',
          surface: '#0d1117',
          panel: '#111622',
          card: '#161c2a',
          border: '#1f293d',
          borderHover: '#334155',
          text: '#f1f5f9',
          muted: '#8b9bb4',
          subtle: '#475569',
          green: '#10b981',
          greenGlow: '#059669',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#a855f7',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
