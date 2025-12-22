import { Shield, FileText, Github, Twitter, MessageCircle } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-border bg-secondary-bg/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-neon-green/10 rounded-lg flex items-center justify-center border border-neon-green/30">
                <span className="text-lg">⚔️</span>
              </div>
              <h3 className="text-lg font-bold neon-text">FlipDuel</h3>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              The ultimate 1v1 duel arena. Fast, fair, and provably random battles on the blockchain.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Information</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#fair"
                  className="text-sm text-text-muted hover:text-neon-green transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Provably Fair
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-sm text-text-muted hover:text-neon-green transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#guide"
                  className="text-sm text-text-muted hover:text-neon-green transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  How to Play
                </a>
              </li>
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Community</h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center hover:border-neon-green hover:text-neon-green transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center hover:border-neon-green hover:text-neon-green transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center hover:border-neon-green hover:text-neon-green transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {currentYear} FlipDuel. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Built on <span className="text-neon-green font-semibold">Casper Network</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
