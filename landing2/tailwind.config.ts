import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        synapse: {
          blue: '#3B82F6',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 60px rgba(59,130,246,0.2)',
        'glow-sm': '0 0 30px rgba(59,130,246,0.1)',
        card: '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.21, 0.47, 0.32, 0.98)',
      },
    },
  },
  plugins: [],
} satisfies Config
