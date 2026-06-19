/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface scale
        surface:                    '#111317',
        'surface-dim':              '#111317',
        'surface-bright':           '#37393e',
        'surface-container-lowest': '#0c0e12',
        'surface-container-low':    '#1a1c20',
        'surface-container':        '#1e2024',
        'surface-container-high':   '#282a2e',
        'surface-container-highest':'#333539',
        'surface-variant':          '#333539',
        // On-surface
        'on-surface':         '#e2e2e8',
        'on-surface-variant': '#c7c4d7',
        'inverse-surface':    '#e2e2e8',
        'inverse-on-surface': '#2f3035',
        // Outline
        'outline':         '#908fa0',
        'outline-variant': '#464554',
        // Primary (Indigo)
        'surface-tint':              '#c0c1ff',
        'primary':                   '#c0c1ff',
        'on-primary':                '#1000a9',
        'primary-container':         '#8083ff',
        'on-primary-container':      '#0d0096',
        'inverse-primary':           '#494bd6',
        'primary-fixed':             '#e1e0ff',
        'primary-fixed-dim':         '#c0c1ff',
        'on-primary-fixed':          '#07006c',
        'on-primary-fixed-variant':  '#2f2ebe',
        // Secondary (Blue)
        'secondary':                 '#adc6ff',
        'on-secondary':              '#002e6a',
        'secondary-container':       '#0566d9',
        'on-secondary-container':    '#e6ecff',
        'secondary-fixed':           '#d8e2ff',
        'secondary-fixed-dim':       '#adc6ff',
        'on-secondary-fixed':        '#001a42',
        'on-secondary-fixed-variant':'#004395',
        // Tertiary (Orange)
        'tertiary':                  '#ffb783',
        'on-tertiary':               '#4f2500',
        'tertiary-container':        '#d97721',
        'on-tertiary-container':     '#452000',
        'tertiary-fixed':            '#ffdcc5',
        'tertiary-fixed-dim':        '#ffb783',
        'on-tertiary-fixed':         '#301400',
        'on-tertiary-fixed-variant': '#703700',
        // Error
        'error':             '#ffb4ab',
        'on-error':          '#690005',
        'error-container':   '#93000a',
        'on-error-container':'#ffdad6',
        // Background
        'background':    '#111317',
        'on-background': '#e2e2e8',
        // Semantic aliases for convenience
        'indigo-accent': '#8083ff',
        'blue-accent':   '#adc6ff',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
        geist: ['Geist', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg':       ['48px', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'headline-md':      ['24px', { lineHeight: '32px', fontWeight: '500', letterSpacing: '-0.01em' }],
        'body-base':        ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm':          ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps':       ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.05em' }],
        'headline-md-mobile':['20px',{ lineHeight: '28px', fontWeight: '500' }],
      },
      borderRadius: {
        sm:      '0.125rem',
        DEFAULT: '0.25rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        full:    '9999px',
      },
      spacing: {
        'base': '4px',
        'xs':   '8px',
        'sm':   '16px',
        'md':   '24px',
        'lg':   '40px',
        'xl':   '64px',
        'container-max': '1440px',
        'gutter': '24px',
      },
      boxShadow: {
        'float': '0px 8px 32px rgba(0,0,0,0.4)',
        'card':  '0px 1px 4px rgba(0,0,0,0.3)',
      },
      backdropBlur: {
        'nav': '12px',
      },
    },
  },
  plugins: [],
}
