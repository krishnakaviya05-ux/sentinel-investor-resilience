/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SENTINEL design system
        canvas: {
          950: '#07090f',
          900: '#0d1117',
          800: '#131920',
          700: '#1a2230',
          600: '#1e2a3a',
        },
        border: {
          DEFAULT: '#1f2d3d',
          subtle: '#162030',
          bright: '#2a3f55',
        },
        accent: {
          DEFAULT: '#3b8fe8',
          light: '#5ba3f0',
          dim: '#1e4a7a',
          muted: '#1a3a5c',
        },
        risk: {
          high: '#ef4444',
          'high-bg': '#1a0808',
          'high-border': '#3d1111',
          medium: '#f59e0b',
          'medium-bg': '#1a1008',
          'medium-border': '#3d2a08',
          low: '#22c55e',
          'low-bg': '#071a0e',
          'low-border': '#0f3b1e',
          insufficient: '#6b7280',
          'insufficient-bg': '#111827',
          'insufficient-border': '#1f2d3d',
        },
        text: {
          primary: '#f0f4f8',
          secondary: '#8ba3bc',
          muted: '#4a6278',
          dim: '#2a3f55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
