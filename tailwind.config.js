// Configuration file for Tailwind CSS.
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'beer-gold': '#FFD700',
        'beer-amber': '#FFBF00',
        'beer-dark': '#281E15',
        'beer-foam': '#F5F5DC',
      },
      fontFamily: {
        // Set Inter as the primary sans-serif font
        'sans': ['Inter', 'sans-serif'],
        'display': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
