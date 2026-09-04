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
        dark: {
          950: '#05070B',
          900: '#090D16',
          850: '#0E1422',
          800: '#141D30',
          750: '#1B263E',
          700: '#233250',
          600: '#32456C',
          500: '#475E8D'
        },
        brand: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          emerald: '#10B981',
          teal: '#14B8A6',
          amber: '#F59E0B',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 9s ease-in-out 3s infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-spin': 'glowSpin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 242, 254, 0.15)',
        'neon-cyan': '0 0 25px -3px rgba(0, 242, 254, 0.4)',
        'neon-violet': '0 0 25px -3px rgba(139, 92, 246, 0.4)',
        'neon-emerald': '0 0 25px -3px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
