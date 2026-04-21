module.exports = {
  content: ['./pages/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins','system-ui','sans-serif'] },
      colors: {
        primary: { 50:'#f0f4ff',100:'#e0e9ff',200:'#c7d8fe',300:'#a4bcfd',400:'#7f97fa',500:'#5f6ef5',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81' }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(79,70,229,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,0.04) 1px,transparent 1px)',
      },
      backgroundSize: { grid:'40px 40px' },
    },
  },
  plugins: [],
};
