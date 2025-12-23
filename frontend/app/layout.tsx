import type { Metadata } from 'next'
import '../styles/globals.css'

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
      <body>{children}</body>
    </html>
  )
}
