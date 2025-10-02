/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9fafb',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
        },
        aca: {
          blue: '#4a5568',
          green: '#059669',
          gray: '#6b7280',
        }
      },
    },
  },
  plugins: [],
}
