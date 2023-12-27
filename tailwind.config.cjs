/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        animation: {
            "child-slide-down": "child-slide-down 1s ease-out",
            "child-slide-up": "child-slide-up 1s ease-out",
            "content-slide-up": "content-slide-up 0.5s ease-out",
            "menu-left-to-right": "menu-left-to-right 0.5s",
            "menu-right-to-left": "menu-right-to-left 0.5s",
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
