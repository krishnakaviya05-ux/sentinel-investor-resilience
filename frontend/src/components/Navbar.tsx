import { Shield } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas-950/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight">SENTINEL</span>
        </a>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <a href="#analyze" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Analyze</a>
          <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
          <a href="#safety" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Safety</a>
        </div>

        {/* Right tag */}
        <div className="text-xs text-text-muted font-medium hidden sm:block">
          Investor Safety First
        </div>
      </div>
    </nav>
  );
}
