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
        obsidian: {
          950: '#000000',
          900: '#050507',
          850: '#0A0A0D',
          800: '#111114',
          750: '#16161A',
          700: '#1C1C21',
          600: '#25252B',
          500: '#32323A',
        },
        titanium: {
          50: '#FFFFFF',
          100: '#F5F5F7',
          200: '#E5E5EA',
          300: '#D2D2D7',
          400: '#A1A1A6',
          500: '#86868B',
          600: '#636366',
          700: '#48484A',
          800: '#3A3A3C',
          900: '#2C2C2E',
          950: '#1C1C1E',
        },
        apple: {
          green: '#30D158',
          emerald: '#28CD41',
          orange: '#FF9F0A',
          red: '#FF453A',
          blue: '#0A84FF',
          silver: '#F5F5F7',
          platinum: '#E8E8ED',
        },
        // Backwards-compatible subtle aliases
        dark: {
          950: '#000000',
          900: '#050507',
          850: '#0A0A0D',
          800: '#111114',
          750: '#16161A',
          700: '#1C1C21',
          600: '#25252B',
          500: '#32323A',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif',
        ],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'specular': '0 1px 0 0 rgba(255, 255, 255, 0.12) inset, 0 20px 48px -12px rgba(0, 0, 0, 0.8)',
        'titanium': '0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 40px -10px rgba(0, 0, 0, 0.85)',
        'apple-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 10px 30px -4px rgba(0, 0, 0, 0.7)',
        'apple-card-hover': '0 0 0 1px rgba(255, 255, 255, 0.16), 0 24px 50px -10px rgba(0, 0, 0, 0.95)',
        'glow-white': '0 0 35px -5px rgba(255, 255, 255, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
