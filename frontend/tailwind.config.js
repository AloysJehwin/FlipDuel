/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Retro 90s color palette
        'retro-beige': '#D4C5A0',
        'retro-coral': '#E57373',
        'retro-blue': '#6B9BC3',
        'retro-green': '#81C784',
        'retro-yellow': '#FFD54F',
        'retro-purple': '#BA68C8',
        'retro-tan': '#C9B896',
        'retro-cream': '#F5F1E8',
        'retro-charcoal': '#2C2C2C',
        // Background and surface colors
        'primary-bg': '#D4C5A0',
        'secondary-bg': '#F5F1E8',
        'surface': '#F5F1E8',
        'surface-dark': '#C9B896',
        'surface-light': '#FDFCF9',
        'border': '#2C2C2C',
        'border-light': '#D4C5A0',
        'border-dark': '#8B7355',
        // Text colors
        'text-primary': '#2C2C2C',
        'text-secondary': '#5A5A5A',
        'text-muted': '#8B8B8B',
        'text-light': '#F5F1E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        retro: ['"Press Start 2P"', 'cursive'],
        display: ['Impact', 'Haettenschweiler', 'Arial Black', 'sans-serif'],
      },
      boxShadow: {
        'retro': '4px 4px 0px rgba(44, 44, 44, 0.3)',
        'retro-lg': '8px 8px 0px rgba(44, 44, 44, 0.3)',
        'retro-xl': '12px 12px 0px rgba(44, 44, 44, 0.3)',
        'retro-inset': 'inset 2px 2px 4px rgba(44, 44, 44, 0.2)',
      },
      backgroundImage: {
        'retro-gradient': 'linear-gradient(135deg, #D4C5A0 0%, #6B9BC3 100%)',
        'retro-dots': 'radial-gradient(circle, #2C2C2C 1px, transparent 1px)',
        'retro-stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(44,44,44,0.05) 10px, rgba(44,44,44,0.05) 20px)',
        'retro-grid': 'linear-gradient(rgba(44,44,44,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(44,44,44,0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '20px 20px',
        'grid': '20px 20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'slideDown': 'slideDown 0.5s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
