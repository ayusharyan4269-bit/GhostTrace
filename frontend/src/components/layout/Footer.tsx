import React from 'react';
import { Ghost, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-ghost-border/80 bg-ghost-bg py-8 mt-16 text-ghost-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Ghost className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-ghost-text font-semibold">GhostTrace</span>
          <span>•</span>
          <span>Hacktoberfest 2026: Ghost in the Machine</span>
        </div>

        {/* Center / Privacy Promise */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400/90 bg-ghost-panel px-3 py-1 rounded-full border border-ghost-border">
          <Shield className="w-3.5 h-3.5" />
          <span>Local-First Open Innovation • No Hosted AI Fallback</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 text-ghost-subtle text-[11px]">
          <span>Honoring the traces left in code</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500/20" />
        </div>
      </div>
    </footer>
  );
};
