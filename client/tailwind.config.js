// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Add this line
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#6366f1',
        // Define dark mode colors if needed, e.g.,
        dark: {
          primary: '#1f2937', // Example: Dark background
          secondary: '#374151', // Example: Slightly lighter dark background
          text: '#d1d5db',    // Example: Light text for dark mode
        }
      }
    },
  },
  plugins: [],
}