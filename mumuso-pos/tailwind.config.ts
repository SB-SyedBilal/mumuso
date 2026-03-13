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
        'mumuso-dark': '#1C1C1E',
        'mumuso-gold': '#C8A96E',
        'mumuso-success': '#34C759',
        'mumuso-error': '#FF3B30',
      },
    },
  },
  plugins: [],
}
export default config
