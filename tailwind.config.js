/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        surface: {
          50: '#f8fafc',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#6b7280',
          400: '#171717',
          500: '#0a0a0a',
        },
        primary: {
          50: '#f7ffe0',
          100: '#eaff8b',
          200: '#d6ff4b',
          300: '#b6e900',
          400: '#a3d900',
        },
        danger: {
          100: '#ffb3b3',
          200: '#ff6b6b',
          300: '#ff3b3b',
        },
        success: {
          100: '#d4ffb3',
          200: '#a3ff6b',
          300: '#6bff3b',
        },
        quick: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
        },
        stroke: {
          100: '#e5e7eb',
          200: '#d1d5db',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      borderRadius: {
        xl: '24px',
        '2xl': '32px',
      },
    },
  },
  plugins: [],
}; 