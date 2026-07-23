/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif']
      },
      colors: {
        // Paleta de playa brasileña
        ocean: {
          50: '#eafcff',
          100: '#cbf5ff',
          200: '#9ceaff',
          300: '#5cd9fb',
          400: '#22c1ef',
          500: '#06a3d6',
          600: '#0781b3',
          700: '#0d6791',
          800: '#145576',
          900: '#154764',
          950: '#082e44'
        },
        sand: {
          50: '#fdf9f0',
          100: '#faf0da',
          200: '#f4dfb2',
          300: '#edc880',
          400: '#e6ad4d'
        },
        coral: {
          400: '#ff8a5b',
          500: '#ff6b3d',
          600: '#f04e21'
        }
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(8, 46, 68, 0.35)'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pop: 'pop 0.35s ease-out'
      }
    }
  },
  plugins: []
};
