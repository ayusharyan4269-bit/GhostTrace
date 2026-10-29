import React from 'react';
import { Ghost, History, Monitor, ShieldCheck } from 'lucide-react';
import { ModelStatusBadge } from '../status/ModelStatusBadge';
import { HealthResponse } from '../../types';

interface HeaderProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  onRefreshHealth: () => void;
  savedSessionsCount: number;
  onOpenSessions: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  healthLoading,
  onRefreshHealth,
  savedSessionsCount,
  onOpenSessions,
  scanlinesEnabled,
  onToggleScanlines,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ghost-border/80 bg-ghost-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 shadow-sm">
            <Ghost className="w-5 h-5 animate-subtle-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-base text-ghost-text">
                GHOST<span className="text-emerald-400">TRACE</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wide rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 uppercase">
                v1.0 Local AI
              </span>
            </div>
            <p className="text-[11px] text-ghost-muted hidden sm:block">
              Every command leaves a trace. Some traces tell stories.
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Local Model Status */}
          <ModelStatusBadge
            health={health}
            loading={healthLoading}
            onRefresh={onRefreshHealth}
          />

          {/* Scanline CRT Toggle */}
          <button
            onClick={onToggleScanlines}
            className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              scanlinesEnabled
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-ghost-panel border-ghost-border text-ghost-muted hover:text-ghost-text'
            }`}
            title={scanlinesEnabled ? 'CRT scanlines enabled' : 'Enable CRT scanlines'}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline font-mono text-[11px]">CRT</span>
          </button>

          {/* Privacy Guarantee button */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border text-ghost-muted hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            title="Privacy and Local-First Architecture"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline font-mono text-[11px]">Privacy</span>
          </button>

          {/* Saved Sessions Drawer Button */}
          <button
            onClick={onOpenSessions}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border hover:border-ghost-borderHover text-xs font-mono text-ghost-text transition-colors"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Sessions</span>
            {savedSessionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] text-emerald-300 font-bold">
                {savedSessionsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
