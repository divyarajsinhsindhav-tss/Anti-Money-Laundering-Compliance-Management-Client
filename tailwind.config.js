/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#60a5fa',   // blue-400
          lighter: '#eff6ff', // blue-50
          dark: '#1e40af',    // blue-800
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          light: '#94a3b8',   // slate-400
          lighter: '#f1f5f9', // slate-100
          dark: '#334155',    // slate-700
        },
        surface: {
          DEFAULT: '#ffffff',
          light: '#f8fafc',   // slate-50
          dark: '#0f172a',    // slate-900
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          light: '#fef2f2',   // red-50
          border: '#fee2e2',  // red-100
        },
        success: {
          DEFAULT: '#16a34a', // green-600
          light: '#f0fdf4',   // green-50
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fffbeb',   // amber-50
        },
        info: {
          DEFAULT: '#0ea5e9', // sky-500
          light: '#f0f9ff',   // sky-50
        },
      },
      borderRadius: {
        'custom': '0.5rem',   // standard lg
      }
    },
  },
  plugins: [],
}
