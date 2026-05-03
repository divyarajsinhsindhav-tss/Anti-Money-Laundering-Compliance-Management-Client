/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#60a5fa', // blue-400
          lighter: '#dbeafe', // blue-100
          dark: '#1e40af', // blue-800
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          light: '#94a3b8', // slate-400
          lighter: '#f1f5f9', // slate-100
          dark: '#334155', // slate-700
        },
        surface: {
          DEFAULT: '#ffffff',
          light: '#f8fafc', // slate-50
          dark: '#0f172a', // slate-900
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          light: '#fee2e2', // red-100
          border: '#fecaca', // red-200
        },
        success: {
          DEFAULT: '#16a34a', // green-600
          light: '#dcfce7', // green-100
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fef3c7', // amber-100
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          light: '#e0f2fe', // sky-100
        },
        gray: {
          800: '#1f2937',
        },
      },
      borderRadius: {
        custom: '0.5rem', // standard lg
      },
    },
  },
  plugins: [],
};
