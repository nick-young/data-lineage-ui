/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Restore original content paths
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
    // "./src/LandingPage.tsx", // Remove specific path
  ],
  // Uncomment the theme extension to use custom colors
  theme: {
    extend: {
      colors: { 
        'primary': '#3056D3', // Match LandingPage Hero section color
        'blue-dark': '#1E2B40', // Example dark blue
        'dark': '#090E34',
        'body-color': '#637381',
        'dark-6': '#F1F2F3',
        // Add other colors from LandingPage if needed
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Add Inter font family
      }
    },
  },
  plugins: [],
} 