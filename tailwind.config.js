/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Restore original content paths
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
    // "./src/LandingPage.tsx", // Remove specific path
  ],
  // Temporarily comment out the theme extension
  /*
  theme: {
    extend: {
      colors: { 
        'primary': '#211C84',
        'accent': '#4D55CC',
        'accent-light': '#7A73D1',
        'subtle-bg': '#B5A8D5',
      }
    },
  },
  */
  theme: {}, // Use default theme
  plugins: [],
} 