import React from 'react';
import { Terminal, Trash2, AlertCircle } from 'lucide-react';

interface TerminalInputProps {
  value: string;
  onChange: (val: string) => void;
  maxChars?: number;
  placeholder?: string;
  onClear: () => void;
  disabled?: boolean;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  maxChars = 150000,
  placeholder = 'Paste terminal output, server logs, stack traces, or command histories here...',
  onClear,
  disabled = false,
}) => {
  const charCount = value.length;
  const isNearLimit = charCount > maxChars * 0.85;
  const isOverLimit = charCount > maxChars;

  // Approximate line count
  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="flex flex-col rounded-xl border border-ghost-border bg-ghost-surface overflow-hidden shadow-xl focus-within:border-emerald-600/50 transition-colors">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ghost-panel border-b border-ghost-border select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="ml-2 font-mono text-xs text-ghost-muted flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            session_trace.log
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lineCount > 0 && (
            <span className="font-mono text-[11px] text-ghost-subtle hidden sm:inline">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          )}

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className={isOverLimit ? 'text-rose-400 font-bold' : isNearLimit ? 'text-amber-400' : 'text-ghost-subtle'}>
              {charCount.toLocaleString()}
            </span>
            <span className="text-ghost-subtle">/ {maxChars.toLocaleString()}</span>
          </div>

          {value && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="p-1 rounded text-ghost-subtle hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Clear terminal buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={12}
          spellCheck={false}
          className="w-full p-4 bg-ghost-bg font-mono text-xs sm:text-sm text-emerald-200/90 placeholder:text-ghost-subtle/70 focus:outline-none resize-y leading-relaxed"
        />

        {isOverLimit && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-rose-950/90 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5 shadow-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            Input exceeds limit. Please truncate before analyzing.
          </div>
        )}
      </div>
    </div>
  );
};
