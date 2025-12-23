import Link from 'next/link'
import { Shield, FileText, Github, Twitter, MessageCircle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t-4 border-border bg-win95-light mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-retro-coral border-4 border-border flex items-center justify-center shadow-retro">
                <span className="text-2xl">⚔️</span>
              </div>
              <div>
                <h3 className="retro-heading text-xl leading-none">FLIP DUEL</h3>
                <p className="text-xs text-text-muted uppercase font-bold">Trading Arena</p>
              </div>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-md">
              Live crypto trading duels on the blockchain. Compete head-to-head, trade in real-time, and winner takes all. Provably fair and fully transparent.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="retro-subheading text-sm mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/lobby" className="text-sm text-text-muted hover:text-retro-coral transition-colors font-medium">
                  → Browse Duels
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm text-text-muted hover:text-retro-coral transition-colors font-medium">
                  → Create Duel
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm text-text-muted hover:text-retro-coral transition-colors font-medium">
                  → My History
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-text-muted hover:text-retro-coral transition-colors font-medium">
                  → How to Play
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="retro-subheading text-sm mb-4">COMMUNITY</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="#"
                className="w-12 h-12 bg-retro-blue border-4 border-border flex items-center justify-center text-text-light hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-retro transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-retro-blue border-4 border-border flex items-center justify-center text-text-light hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-retro transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-border border-4 border-border flex items-center justify-center text-text-light hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-retro transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t-4 border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted font-bold uppercase">
              © {currentYear} FlipDuel. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a href="#" className="text-text-muted hover:text-retro-coral transition-colors font-medium">
                Terms
              </a>
              <span className="text-text-muted">•</span>
              <a href="#" className="text-text-muted hover:text-retro-coral transition-colors font-medium">
                Privacy
              </a>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted font-bold">
                Built on <span className="text-retro-blue">Blockchain</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
