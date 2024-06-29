/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'background': 'var(--background)',
        'logo': 'var(--logo)',
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
        'text': 'var(--text)',
        'light': 'var(--light)',
        'tick': 'var(--tick)',
        'mask': 'var(--mask)',
        'tooltip': 'var(--tooltip)',

        'icon': 'var(--icon)',
        'icon-hover': 'var(--icon-hover)',
      }
    },
  },
  plugins: [],
  darkMode: 'selector',
}

