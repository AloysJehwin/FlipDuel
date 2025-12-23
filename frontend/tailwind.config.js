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
        // 90s Gaming Arcade Theme - Neon & Vibrant
        'retro-purple': '#B026FF',
        'retro-purple-light': '#D896FF',
        'retro-purple-dark': '#8B00FF',
        'retro-cyan': '#00FFFF',
        'retro-cyan-light': '#7DFFFF',
        'retro-cyan-dark': '#00D4D4',
        'retro-pink': '#FF1493',
        'retro-neon-green': '#39FF14',
        'retro-neon-orange': '#FF6600',
        'retro-neon-yellow': '#FFFF00',
        'retro-beige': '#1A0033',
        'retro-coral': '#FF1493',
        'retro-blue': '#00FFFF',
        'retro-green': '#39FF14',
        'retro-yellow': '#FFFF00',
        'retro-tan': '#2D0052',
        'retro-cream': '#FFFFFF',
        'retro-charcoal': '#FFFFFF',
        // Background and surface colors
        'primary-bg': '#0A0015',
        'secondary-bg': '#1A0033',
        'surface': '#1A0033',
        'surface-dark': '#0A0015',
        'surface-light': '#2D0052',
        'border': '#B026FF',
        'border-light': '#00FFFF',
        'border-dark': '#8B00FF',
        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#00FFFF',
        'text-muted': '#B896FF',
        'text-light': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        retro: ['"Press Start 2P"', 'cursive'],
        display: ['Impact', 'Haettenschweiler', 'Arial Black', 'sans-serif'],
      },
      boxShadow: {
        'retro': '0 0 20px rgba(176, 38, 255, 0.6), 4px 4px 0px rgba(176, 38, 255, 0.4)',
        'retro-lg': '0 0 30px rgba(176, 38, 255, 0.8), 8px 8px 0px rgba(176, 38, 255, 0.5)',
        'retro-xl': '0 0 40px rgba(176, 38, 255, 1), 12px 12px 0px rgba(176, 38, 255, 0.6)',
        'retro-inset': 'inset 0 0 15px rgba(0, 255, 255, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.8), 0 0 40px rgba(255, 20, 147, 0.4)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.8), 0 0 40px rgba(57, 255, 20, 0.4)',
      },
      backgroundImage: {
        'retro-gradient': 'linear-gradient(135deg, #B026FF 0%, #00FFFF 100%)',
        'retro-dots': 'radial-gradient(circle, #B026FF 1px, transparent 1px)',
        'retro-stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(176,38,255,0.1) 10px, rgba(176,38,255,0.1) 20px)',
        'retro-grid': 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
        'neon-grid': 'linear-gradient(rgba(176,38,255,0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(176,38,255,0.2) 2px, transparent 2px)',
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
