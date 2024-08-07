/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontSize: {
        '4xs': '0.625rem',
        '3xs': '0.6875rem',
        '2xs': '0.75rem',
        xs: '0.8125rem',
        sm: '0.875rem',
        md: '0.9375rem',
        base: '1rem',
        xl: '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.375rem',
        '4xl': '1.5rem',
      },
      colors: {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'background': 'var(--background)',
        'container': 'var(--container)',
        'logo': 'var(--logo)',
        'switcher': 'var(--switcher)',
        'sidebar': 'var(--sidebar)',
        'view': 'var(--view)',
        'shade': {
          1: 'var(--shade-1)',
          2: 'var(--shade-2)',
          3: 'var(--shade-3)',
          4: 'var(--shade-4)',
          5: 'var(--shade-5)',
          6: 'var(--shade-6)',
          7: 'var(--shade-7)',
          8: 'var(--shade-8)',
          9: 'var(--shade-9)',
          10: 'var(--shade-10)',
        },
        'alert': 'var(--alert)',
        'border': 'var(--border)',
        'sidebar-border': 'var(--sidebar-border)',
        'switcher-border': 'var(--switcher-border)',
        'link': 'var(--link)',
        'text': 'var(--text)',
        'light': 'var(--light)',
        'pill': 'var(--pill)',
        'mask': 'var(--mask)',
        'tooltip': 'var(--tooltip)',

        'icon': 'var(--icon)',
        'icon-hover': 'var(--icon-hover)',

        'avatar': 'var(--avatar)',
      }
    },
  },
  plugins: [],
  darkMode: 'selector',
}

