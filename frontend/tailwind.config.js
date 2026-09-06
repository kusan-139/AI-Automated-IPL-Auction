/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#151C2C',
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
        muted: '#94A3B8',
        border: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
