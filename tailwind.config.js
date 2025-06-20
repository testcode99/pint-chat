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
          // Using default sans-serif and a fallback display font
          'display': ['Georgia', 'serif'],
        },
      },
    },
    plugins: [],
  };
