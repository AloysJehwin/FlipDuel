import type { Metadata } from 'next'
import '../styles/globals.css'
import { WalletProvider } from '@/contexts/WalletContext'

export const metadata: Metadata = {
  title: 'FlipDuel - Live Crypto Trading Duels',
  description: 'Battle traders in real-time. Pick your token, trade for the time limit, highest gains win. Winner takes all!',
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
