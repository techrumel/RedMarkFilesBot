// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- Changed 'tailwindcss' to '@tailwindcss/postcss'
    autoprefixer: {},
  },
}