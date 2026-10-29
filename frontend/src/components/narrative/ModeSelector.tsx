import React from 'react';
import { Ghost, Terminal, Search, Heart, Sparkles } from 'lucide-react';
import { NarrativeMode } from '../../types';

interface ModeSelectorProps {
  selectedMode: NarrativeMode;
  onSelectMode: (mode: NarrativeMode) => void;
  disabled?: boolean;
}

interface ModeConfig {
  id: NarrativeMode;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badge: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'haunted_chronicle',
    title: 'Haunted Chronicle',
    tagline: 'Atmospheric Horror',
    description: 'Cinematic, eerie, and unsettling narrative treating background processes and errors as restless phantoms.',
    icon: <Ghost className="w-5 h-5 text-purple-400" />,
    accentColor: 'border-purple-500/80 bg-purple-950/20 shadow-purple-950/40 text-purple-400',
    badge: 'Horror',
  },
  {
    id: 'digital_seance',
    title: 'Digital Séance',
    tagline: 'Abandoned Machine Voice',
    description: 'The ancient machine speaks in the first-person, whispering of its forgotten registers and departed operators.',
    icon: <Terminal className="w-5 h-5 text-emerald-400" />,
    accentColor: 'border-emerald-500/80 bg-emerald-950/20 shadow-emerald-950/40 text-emerald-400',
    badge: 'Séance',
  },
  {
    id: 'forensic_detective',
    title: 'Forensic Detective',
    tagline: 'Noir Cyber-Investigation',
    description: 'Evidence-first incident report investigating root cause, failure timelines, suspect processes, and technical hypotheses.',
    icon: <Search className="w-5 h-5 text-amber-400" />,
    accentColor: 'border-amber-500/80 bg-amber-950/20 shadow-amber-950/40 text-amber-400',
    badge: 'Forensics',
  },
  {
    id: 'lost_memory',
    title: 'Lost Memory',
    tagline: 'Honoring Developer Traces',
    description: 'Poetic reflection on the human effort in unfinished code, forgotten commits, and honoring developer artifacts.',
    icon: <Heart className="w-5 h-5 text-cyan-400" />,
    accentColor: 'border-cyan-500/80 bg-cyan-950/20 shadow-cyan-950/40 text-cyan-400',
    badge: 'Día de Muertos',
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-ghost-muted uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Choose Narrative Engine Mode
        </label>
        <span className="text-[11px] font-mono text-ghost-subtle">
          Evidence-grounded output
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              disabled={disabled}
              onClick={() => onSelectMode(mode.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? `${mode.accentColor} shadow-lg border-opacity-100`
                  : 'bg-ghost-surface hover:bg-ghost-panel border-ghost-border hover:border-ghost-borderHover'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ghost-panel border border-ghost-border">
                    {mode.icon}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-white/10 border-white/20 text-ghost-text font-bold'
                        : 'bg-ghost-panel border-ghost-border text-ghost-subtle'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-ghost-text">
                  {mode.title}
                </h4>
                <p className="text-[11px] font-mono text-ghost-subtle mt-0.5">
                  {mode.tagline}
                </p>
                <p className="text-xs text-ghost-muted mt-2 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-ghost-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Mode
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
