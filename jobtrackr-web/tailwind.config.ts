import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const hsl = (v: string) => `hsl(var(--${v}))`;

const config: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}', // stage colour classes live in lib/constants.ts
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-body)', 'sans-serif'],
      },
      colors: {
        background: hsl('background'),
        foreground: hsl('foreground'),
        card: { DEFAULT: hsl('card'), foreground: hsl('card-foreground') },
        popover: { DEFAULT: hsl('popover'), foreground: hsl('popover-foreground') },
        primary: { DEFAULT: hsl('primary'), foreground: hsl('primary-foreground') },
        secondary: { DEFAULT: hsl('secondary'), foreground: hsl('secondary-foreground') },
        muted: { DEFAULT: hsl('muted'), foreground: hsl('muted-foreground') },
        accent: { DEFAULT: hsl('accent'), foreground: hsl('accent-foreground') },
        destructive: { DEFAULT: hsl('destructive'), foreground: hsl('destructive-foreground') },
        border: hsl('border'),
        input: hsl('input'),
        ring: hsl('ring'),
        chart: { 1: hsl('chart-1'), 2: hsl('chart-2'), 3: hsl('chart-3'), 4: hsl('chart-4'), 5: hsl('chart-5') },
        // The five pipeline stages, per theme via CSS variables (globals.css).
        stage: {
          saved: 'rgb(var(--stage-saved) / <alpha-value>)',
          applied: 'rgb(var(--stage-applied) / <alpha-value>)',
          interview: 'rgb(var(--stage-interview) / <alpha-value>)',
          offer: 'rgb(var(--stage-offer) / <alpha-value>)',
          rejected: 'rgb(var(--stage-rejected) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glow: '0 0 24px -4px var(--glow, hsl(var(--primary) / var(--glow-alpha)))',
      },
      keyframes: {
        'grow-x': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'grow-x': 'grow-x 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [animate],
};

export default config;
