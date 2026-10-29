import React from 'react';
import { Skull, Server, GitCommit, Sparkles, ArrowRight } from 'lucide-react';
import { ScenarioItem } from '../../types';

interface ScenarioPickerProps {
  scenarios: ScenarioItem[];
  selectedScenarioId: string | null;
  onSelectScenario: (scenario: ScenarioItem) => void;
  disabled?: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  disabled = false,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'midnight_process':
        return <Skull className="w-5 h-5 text-purple-400" />;
      case 'forgotten_server':
        return <Server className="w-5 h-5 text-amber-400" />;
      case 'last_commit':
        return <GitCommit className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-ghost-muted uppercase tracking-wider">
          Fictional Pre-loaded Scenarios
        </span>
        <span className="px-2 py-0.5 rounded-full bg-ghost-panel border border-ghost-border text-[10px] font-mono text-ghost-subtle">
          1-Click Demo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((s) => {
          const isSelected = selectedScenarioId === s.id;
          return (
            <button
              key={s.id}
              disabled={disabled}
              onClick={() => onSelectScenario(s)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                  : 'bg-ghost-surface hover:bg-ghost-panel border-ghost-border hover:border-ghost-borderHover'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-ghost-panel border border-ghost-border group-hover:border-ghost-borderHover">
                    {getIcon(s.id)}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      LOADED
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-ghost-text group-hover:text-emerald-300 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-ghost-muted mt-1 leading-relaxed">
                  {s.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-ghost-border/60 flex items-center justify-between text-[11px] font-mono text-ghost-subtle group-hover:text-emerald-400">
                <span>Load Scenario</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
