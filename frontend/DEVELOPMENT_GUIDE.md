# FlipDuel Development Guide

## 🎯 Quick Start

The development server is already running at **http://localhost:3000**

## 📋 What's Been Built

### ✅ Complete Feature Set

1. **App Router Architecture** (Next.js 16)
   - Modern app directory structure
   - Server and client components
   - TypeScript configuration

2. **Design System**
   - Custom Tailwind theme with premium colors
   - Neon green (`#22C55E`) primary accent
   - Dark theme (`#0B0E11`, `#0F172A`, `#111827`)
   - Inter font + Press Start 2P for arcade elements

3. **Core Components**
   - `Button` - Multiple variants (primary, secondary, ghost)
   - `Card` - Reusable card container with hover effects
   - `Avatar` - Multiple sizes with fallback support
   - `Badge` - Status indicators with color variants

4. **Feature Components**
   - **Navbar** - Fixed header with wallet, profile dropdown, mobile menu
   - **DuelArena** - Main battle area with 4 states (waiting, countdown, fighting, result)
   - **PlayerCard** - Shows player stats, avatar, level, wager, win rate
   - **WagerPanel** - Amount input with presets (25, 50, 100, MAX)
   - **LiveSidebar** - Real-time duels feed, recent wins, 24h stats
   - **Footer** - Minimal footer with links and social icons

5. **Visual Effects**
   - Neon glow shadows (green, cyan, purple)
   - Subtle CRT scanline overlay (5% opacity)
   - Smooth transitions and hover states
   - Pulse and glow animations
   - Gradient text effects

6. **Responsive Design**
   - Desktop-first approach
   - Tablet optimized (768px+)
   - Mobile adaptive (sidebar collapses, cards stack)
   - Touch-friendly interface

## 🎮 How the Demo Works

### Duel Flow (Simulated)

1. **Initial State**: Player 1 card visible, Player 2 empty
2. **Create Duel**: User sets wager and clicks "Create Duel"
3. **Matching**: Simulated opponent appears after 1.5s
4. **Countdown**: 3-2-1 countdown (3 seconds)
5. **Fighting**: Battle animation (2 seconds)
6. **Result**: Winner revealed with prize pool (5 seconds)
7. **Reset**: Returns to initial state

### Interactive Elements

- **Wager Input**: Type custom amount or use presets
- **Profile Dropdown**: Click avatar to show menu
- **Mobile Menu**: Hamburger menu on small screens
- **Live Duels**: Clickable duel cards in sidebar
- **Hover Effects**: Cards glow on hover

## 🎨 Customization

### Colors (tailwind.config.js)

```javascript
colors: {
  'primary-bg': '#0B0E11',      // Main background
  'secondary-bg': '#0F172A',    // Secondary background
  'surface': '#111827',         // Card background
  'neon-green': '#22C55E',      // Primary accent
  'neon-cyan': '#06B6D4',       // Secondary accent
  'neon-purple': '#A855F7',     // Tertiary accent
}
```

### Animations

- `pulse-slow` - 3s pulse effect
- `glow` - 2s glow effect
- `fadeIn` - 0.3s fade in
- `slideUp` - 0.3s slide up

### Utility Classes

- `.neon-text` - Green glowing text
- `.arcade-text` - Retro arcade font with glow
- `.card` - Standard card styling
- `.card-hover` - Card with hover effect
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button

## 🔧 Development Tips

### Adding New Colors

Edit `tailwind.config.js` and add to the `extend.colors` section.

### Creating New Components

Follow the pattern:
```
components/
  YourComponent.tsx  (feature component)
  ui/
    YourUIComponent.tsx  (base UI component)
```

### State Management

Currently uses local React state. For real implementation:
- Add React Query for API calls
- Add Zustand/Redux for global state
- Add WebSocket for real-time updates

### Styling

Use Tailwind classes directly. For complex hover states, use `clsx`:

```tsx
import clsx from 'clsx'

<div className={clsx(
  'base-class',
  isActive && 'active-class',
  'hover:hover-class'
)} />
```

## 🚀 Production Deployment

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
vercel deploy
```

## 📦 Key Dependencies

- `next@latest` - React framework
- `react@latest` - UI library
- `tailwindcss@^3.4.0` - Styling
- `lucide-react@^0.469.0` - Icons
- `clsx@^2.1.1` - Class name utility
- `typescript@latest` - Type safety

## 🎯 Next Steps (For Real Implementation)

1. **Backend Integration**
   - Connect to Casper blockchain
   - Smart contract interaction
   - Wallet connection (Casper Signer, etc.)

2. **Real-time Features**
   - WebSocket for live updates
   - Real player matching
   - Live duel broadcasts

3. **User Authentication**
   - Wallet-based auth
   - User profiles
   - Session management

4. **Game Logic**
   - Fair random number generation
   - Bet validation
   - Win calculation
   - Transaction handling

5. **Additional Features**
   - Chat system
   - Leaderboards (functional)
   - Game history
   - Statistics dashboard
   - Achievement system

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Limitations

- Demo data is simulated (no real backend)
- No actual wallet integration
- No real blockchain transactions
- Single player simulation only
- CSS @apply warnings (Tailwind - safe to ignore)

## 💡 Tips

- The app uses `'use client'` for interactive components
- Server components are in `app/layout.tsx`
- Global styles include CRT effect - adjust opacity in `globals.css`
- Neon glows can be customized in `tailwind.config.js` shadows
- Arcade font loads from Google Fonts - may be slow on first load

---

**Development Server**: Running at http://localhost:3000
**Stop Server**: Press Ctrl+C in terminal
**Restart Server**: Run `npm run dev` in the frontend directory
