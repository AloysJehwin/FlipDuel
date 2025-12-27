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
        // Modern Dark Theme with Red & Gray Contrast (matching reference image)
        'retro-cherry': '#DC143C',
        'retro-cherry-light': '#FF1744',
        'retro-cherry-dark': '#B71C1C',
        'retro-burgundy': '#8B0000',
        'retro-maroon': '#C41E3A',
        'retro-brown-black': '#1A1A1A',
        'retro-brown': '#2A2A2A',
        'retro-tan-dark': '#353535',
        'retro-beige': '#1A1A1A',
        'retro-coral': '#DC143C',
        'retro-blue': '#DC143C',
        'retro-green': '#DC143C',
        'retro-yellow': '#DC143C',
        'retro-purple': '#DC143C',
        'retro-pink': '#DC143C',
        'retro-tan': '#2A2A2A',
        'retro-cream': '#FFFFFF',
        'retro-charcoal': '#FFFFFF',
        // Background and surface colors
        'primary-bg': '#0A0A0A',
        'secondary-bg': '#1A1A1A',
        'surface': '#1E1E1E',
        'surface-dark': '#0A0A0A',
        'surface-light': '#2A2A2A',
        'border': '#DC143C',
        'border-light': '#FF1744',
        'border-dark': '#B71C1C',
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#E0E0E0',
        'text-muted': '#9E9E9E',
        'text-light': '#FFFFFF',
        // Accent colors
        'accent-gray': '#4A4A4A',
        'accent-light-gray': '#6A6A6A',
        'accent-success': '#DC143C',
        'accent-warning': '#DC143C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        retro: ['"Press Start 2P"', 'cursive'],
        display: ['Impact', 'Haettenschweiler', 'Arial Black', 'sans-serif'],
        corptic: ['Corptic', 'Impact', 'Arial Black', 'sans-serif'],
      },
      boxShadow: {
        'retro': '0 2px 8px rgba(0, 0, 0, 0.5)',
        'retro-lg': '0 4px 16px rgba(0, 0, 0, 0.6)',
        'retro-xl': '0 8px 24px rgba(0, 0, 0, 0.7)',
        'retro-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        'neon-cyan': '0 2px 8px rgba(139, 0, 0, 0.3)',
        'neon-pink': '0 2px 8px rgba(139, 0, 0, 0.3)',
        'neon-green': '0 2px 8px rgba(139, 0, 0, 0.3)',
      },
      backgroundImage: {
        'retro-gradient': 'linear-gradient(135deg, #8B0000 0%, #2D1810 100%)',
        'retro-dots': 'radial-gradient(circle, rgba(139, 0, 0, 0.1) 1px, transparent 1px)',
        'retro-stripes': 'none',
        'retro-grid': 'none',
        'neon-grid': 'none',
      },
      backgroundSize: {
        'dots': '20px 20px',
        'grid': '20px 20px',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'retro': '0.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'slideDown': 'slideDown 0.5s ease-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(220, 20, 60, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(220, 20, 60, 0.8), 0 0 30px rgba(220, 20, 60, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
