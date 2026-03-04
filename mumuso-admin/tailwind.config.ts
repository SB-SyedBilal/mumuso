import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F3F0',
        surface: '#FFFFFF',
        'surface-dark': '#1C1C1E',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B6B6B',
        'accent-gold': '#C8A96E',
        success: '#4A9B7F',
        error: '#C0544A',
        warning: '#C08040',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
export default config
