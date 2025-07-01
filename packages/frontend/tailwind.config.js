/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Prompt', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1A237E', // น้ำเงินเข้ม
        },
        secondary: {
          DEFAULT: '#FFD600', // เหลือง
        },
        accent: {
          DEFAULT: '#212121', // เทาเข้ม
        },
        info: {
          DEFAULT: '#1976D2', // ฟ้า
        },
        base: {
          100: '#fff',
          200: '#f5f6fa',
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        finno: {
          primary: '#1A237E',
          'primary-content': '#fff',
          secondary: '#FFD600',
          accent: '#212121',
          neutral: '#f5f6fa',
          'base-100': '#fff',
          'base-200': '#f5f6fa',
          info: '#1976D2',
          success: '#388E3C',
          warning: '#FFD600',
          error: '#D32F2F',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    logs: false,
    rtl: false,
    prefix: '',
    defaultTheme: 'finno',
  },
} 