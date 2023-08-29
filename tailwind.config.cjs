/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        colors: {
            "deaconn-header": "#00444E",
            "deaconn-data": "#19253B",
            "deaconn-data2": "#141F32",
            "deaconn-ring": "#083344",
            "deaconn-ring2": "#155e75"
        }
    },
  },
  plugins: [],
};

module.exports = config;
