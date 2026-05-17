/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          container: 'var(--primary-container)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'hero-bg': 'var(--hero-bg)',
        'section-bg': 'var(--section-bg)',
        'on-surface-variant': 'var(--on-surface-variant)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'inverse-primary': 'var(--inverse-primary)',
        error: 'var(--error)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: '8px',
        md: 'var(--radius)',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'elevation-1': '0px 4px 12px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0px 8px 24px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0px 16px 48px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};