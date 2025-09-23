/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/component/**/*.{vue,js,ts,jsx,tsx}",
    "./src/pages/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],  
  safelist: [
    "w-64","w-1/2","rounded-l-lg","rounded-r-lg","bg-gray-200",
    "grid-cols-4","grid-cols-7","h-6","leading-6","h-9","leading-9","shadow-lg"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter","ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica Neue","Arial","Noto Sans","sans-serif","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"],
      },
      transitionProperty: { width: "width" },
      minWidth: { 20: "20rem" },
      colors: {
        cyan: { 50:"#ECFEFF",100:"#CFFAFE",200:"#A5F3FC",300:"#67E8F9",400:"#22D3EE",500:"#06B6D4",600:"#0891B2",700:"#0E7490",800:"#155E75",900:"#164E63" }
      }
    }
  },
  plugins: [require("flowbite/plugin")],
}

