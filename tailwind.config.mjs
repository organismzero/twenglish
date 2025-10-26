/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        aquadark: {
          50:'#e5fbf7',100:'#c8f5ee',200:'#8ee6d8',300:'#5bd1c1',400:'#36b7aa',
          500:'#239c94',600:'#1d7e78',700:'#1a6661',800:'#184f4d',900:'#143f3e',950:'#0a2424'
        }
      },
      boxShadow: { soft: '0 6px 30px rgba(0,0,0,0.25)' },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
}
