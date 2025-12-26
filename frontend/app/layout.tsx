import type { Metadata } from 'next'
import '../styles/globals.css'
import { WalletProvider } from '@/contexts/WalletContext'

export const metadata: Metadata = {
  title: 'FlipDuel - 1v1 Duel Arena',
  description: 'The ultimate 1v1 duel arena. Fast, fair, and provably random battles on the blockchain.',
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
