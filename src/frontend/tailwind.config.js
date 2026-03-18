/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ForeverRaw Brand Palette
        'void': {
          DEFAULT: 'oklch(0.06 0.005 270)',
          '800': 'oklch(0.10 0.005 270)',
          '700': 'oklch(0.14 0.005 270)',
          '600': 'oklch(0.18 0.005 270)',
        },
        'blood-red': {
          DEFAULT: 'oklch(0.50 0.20 25)',
          '900': 'oklch(0.25 0.15 25)',
          '800': 'oklch(0.32 0.17 25)',
          '700': 'oklch(0.38 0.18 25)',
          '600': 'oklch(0.44 0.19 25)',
          '500': 'oklch(0.50 0.20 25)',
          '400': 'oklch(0.56 0.19 25)',
          '300': 'oklch(0.62 0.17 25)',
        },
        'ember-orange': {
          DEFAULT: 'oklch(0.65 0.18 45)',
          '900': 'oklch(0.35 0.14 45)',
          '800': 'oklch(0.45 0.16 45)',
          '700': 'oklch(0.55 0.17 45)',
          '600': 'oklch(0.62 0.18 45)',
          '500': 'oklch(0.65 0.18 45)',
          '400': 'oklch(0.70 0.17 45)',
        },
        'stone': {
          DEFAULT: 'oklch(0.45 0.01 60)',
          '950': 'oklch(0.08 0.005 270)',
          '900': 'oklch(0.12 0.005 270)',
          '800': 'oklch(0.18 0.008 270)',
          '700': 'oklch(0.25 0.008 270)',
          '600': 'oklch(0.35 0.008 60)',
          '500': 'oklch(0.45 0.01 60)',
          '400': 'oklch(0.55 0.01 60)',
          '300': 'oklch(0.65 0.01 60)',
          '200': 'oklch(0.75 0.01 60)',
          '100': 'oklch(0.85 0.008 60)',
        },
        // Shadcn tokens
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        blood: '0 0 15px rgba(139, 0, 0, 0.3)',
        'blood-lg': '0 0 30px rgba(139, 0, 0, 0.4)',
        ember: '0 0 15px rgba(200, 80, 0, 0.3)',
        'ember-lg': '0 0 30px rgba(200, 80, 0, 0.4)',
        stone: '0 2px 8px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        'dragon-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        'ember-flicker': {
          '0%, 100%': { opacity: '1' },
          '25%': { opacity: '0.8' },
          '75%': { opacity: '0.9' },
        },
        'stone-crack': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
      animation: {
        'dragon-pulse': 'dragon-pulse 3s ease-in-out infinite',
        'ember-flicker': 'ember-flicker 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
