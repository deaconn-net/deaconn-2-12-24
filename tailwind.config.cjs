/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        animation: {
            "child-slide-down": "child-slide-down 1s ease-out",
            "child-slide-up": "child-slide-up 1s ease-out"
        },
        colors: {
            "deaconn-header": "#155e75",
            "deaconn-data": "#19253B",
            "deaconn-data2": "#141F32",
            "deaconn-ring": "#162135",
            "deaconn-ring2": "#155e75"
        }
    },
  },
  plugins: [],
};

module.exports = config;
