import React, { useState, useEffect } from 'react';
import { Sparkles, Sliders, Clock, Cpu, RefreshCw } from 'lucide-react';
import { StoryLength } from '../../types';

interface StoryControlsProps {
  length: StoryLength;
  onChangeLength: (len: StoryLength) => void;
  tone: string;
  onChangeTone: (t: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
  modelReady: boolean;
  modelName: string;
}

export const StoryControls: React.FC<StoryControlsProps> = ({
  length,
  onChangeLength,
  tone,
  onChangeTone,
  onAnalyze,
  isAnalyzing,
  disabled = false,
  modelReady,
  modelName,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-ghost-border bg-ghost-surface/80">
      {/* Parameters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Story Length */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ghost-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Length:
          </span>
          <div className="flex p-0.5 rounded-lg bg-ghost-panel border border-ghost-border">
            {(['concise', 'balanced', 'epic'] as StoryLength[]).map((len) => (
              <button
                key={len}
                disabled={isAnalyzing}
                onClick={() => onChangeLength(len)}
                className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors ${
                  length === len
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-ghost-muted hover:text-ghost-text'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Tone Accent */}
        <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
          <span className="text-xs font-mono text-ghost-muted flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Tone:
          </span>
          <input
            type="text"
            value={tone}
            onChange={(e) => onChangeTone(e.target.value)}
            disabled={isAnalyzing}
            placeholder="e.g. Cold gothic, cyber noir..."
            className="px-2.5 py-1 rounded-lg bg-ghost-panel border border-ghost-border font-mono text-xs text-ghost-text placeholder:text-ghost-subtle focus:outline-none focus:border-emerald-500 w-44"
          />
        </div>
      </div>

      {/* Main Summon Button */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-ghost-subtle">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>{modelName}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${modelReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>

        {isAnalyzing && (
          <span className="font-mono text-xs text-emerald-400 animate-pulse flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Inference ({elapsedSeconds}s)...
          </span>
        )}

        <button
          onClick={onAnalyze}
          disabled={disabled || isAnalyzing}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all shadow-lg ${
            disabled || isAnalyzing
              ? 'bg-ghost-panel border border-ghost-border text-ghost-subtle cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 hover:shadow-emerald-900/80 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Summoning Narrative...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Summon Story</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
