# FlipDuel - 1v1 Duel Arena Frontend

A production-ready frontend for a 1v1 Duel Game built with Next.js (App Router) and Tailwind CSS. The UI features a premium casino-grade layout inspired by Stake.com, combined with subtle retro arcade aesthetics.

## 🎮 Features

- **Instant 1v1 Duels**: Real-time player matching and battles
- **Premium UI/UX**: Clean, modern interface with neon accents and subtle retro effects
- **Responsive Design**: Desktop-first with full tablet and mobile optimization
- **Live Activity Feed**: Real-time updates of active duels and recent wins
- **Provably Fair**: Transparent and verifiable game mechanics (frontend representation)

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **State Management**: React hooks (local state)

## 🎨 Design System

### Colors
- **Background**: `#0B0E11` / `#0F172A`
- **Surface**: `#111827`
- **Borders**: `#1F2937`
- **Primary Accent**: `#22C55E` (electric green)
- **Secondary Accents**: Cyan / Purple for glow effects
- **Text Primary**: `#E5E7EB`
- **Text Muted**: `#9CA3AF`

### Typography
- **Body**: Inter (modern sans-serif)
- **Headings/Arcade**: Press Start 2P (retro arcade font)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── Badge.tsx
│   ├── Navbar.tsx        # Navigation bar
│   ├── DuelArena.tsx     # Main duel arena
│   ├── PlayerCard.tsx    # Player info card
│   ├── WagerPanel.tsx    # Wager input panel
│   ├── LiveSidebar.tsx   # Live activity sidebar
│   └── Footer.tsx        # Footer component
├── styles/
│   └── globals.css       # Global styles & Tailwind
└── tailwind.config.js    # Tailwind configuration
```

## 🎯 Key Components

- **Navbar**: Fixed navigation with wallet balance and profile
- **DuelArena**: Main battle arena with player cards and VS indicator
- **WagerPanel**: Wager input with presets and CTA
- **LiveSidebar**: Real-time activity feed
- **PlayerCard**: Player info with stats and wager

## ✨ Design Features

- Neon glow effects using Tailwind shadows
- Subtle CRT scanline overlay
- Smooth transitions and hover states
- Arcade-style typography for key elements
- Fully responsive (desktop, tablet, mobile)

---

Built with ❤️ using Next.js and Tailwind CSS

## Getting Started

To get started with this project, follow the instructions below.

### Prerequisites

Make sure you have the following installed:

- Node.js (version 12 or later)
- npm (Node package manager)

### Installation

1. Clone the repository:

   git clone <repository-url>

2. Navigate to the project directory:

   cd frontend

3. Install the dependencies:

   npm install

### Running the Development Server

To start the development server, run:

npm run dev

You can now view the application in your browser at `http://localhost:3000`.

### Building for Production

To build the application for production, run:

npm run build

This will create an optimized version of your application in the `.next` folder.

### Running the Production Build

To start the production server, run:

npm start

### Folder Structure

- `pages/`: Contains the application's pages.
- `public/`: Static assets like images and icons.
- `styles/`: Global and component-specific styles.
- `components/`: Reusable components.
- `api/`: API routes for server-side functionality.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.