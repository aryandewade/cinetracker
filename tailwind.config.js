export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        'rating-skip': 'rgb(var(--color-rating-skip) / <alpha-value>)',
        'rating-timepass': 'rgb(var(--color-rating-timepass) / <alpha-value>)',
        'rating-go': 'rgb(var(--color-rating-go) / <alpha-value>)',
        'rating-perfection': 'rgb(var(--color-rating-perfection) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
