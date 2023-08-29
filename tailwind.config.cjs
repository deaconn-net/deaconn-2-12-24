/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        colors: {
            "deaconn-header": "#1f2937",
            "deaconn-data": "#111827",
            "deaconn-data2": "#030712",
            "deaconn-ring": "#083344",
            "deaconn-ring2": "#155e75"
        }
    },
  },
  plugins: [],
};

module.exports = config;
