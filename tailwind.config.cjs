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
            "deaconn-ring2": "#155e75",
            "deaconn-focus": "#155e75",
            "deaconn-focus2": "#0e7490",
            "deaconn-focus3": "#06b6d4",
            "deaconn-input": "#164e63",
            "deaconn-base": "#f9fafb",
            "deaconn-link": "#22d3ee",
            "deaconn-link2": "#67e8f9",
            "deaconn-link3": "#a5f3fc"
        }
    },
  },
  plugins: [],
};

module.exports = config;
