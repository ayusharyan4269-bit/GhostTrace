import React from 'react';
import { X, Sparkles, Terminal, FileCode } from 'lucide-react';
import { ParsedEvent, KeyNarrativeEvent } from '../../types';

interface EvidenceInspectorProps {
  event: ParsedEvent | null;
  keyNarrativeEvent?: KeyNarrativeEvent | null;
  onClose: () => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  event,
  keyNarrativeEvent,
  onClose,
}) => {
  if (!event && !keyNarrativeEvent) return null;
  const eventId = event?.event_id ?? keyNarrativeEvent?.event_id ?? '';
  const evidenceText = event?.raw_text ?? keyNarrativeEvent?.log_evidence ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-ghost-surface border border-ghost-border rounded-xl shadow-2xl p-6 text-ghost-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ghost-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-ghost-panel border border-ghost-border text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ghost-text">Log Evidence Inspector</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-ghost-panel border border-ghost-border text-emerald-400">
                  {eventId}
                </span>
              </div>
              <p className="text-xs text-ghost-muted">Grounding verification for narrative inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ghost-muted hover:text-ghost-text hover:bg-ghost-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          {/* Metadata Grid */}
          {event && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-ghost-panel border border-ghost-border font-mono">
            <div>
              <span className="text-ghost-subtle block">Line Reference</span>
              <span className="text-ghost-text">Line #{event.line_number}</span>
            </div>
            <div>
              <span className="text-ghost-subtle block">Timestamp</span>
              <span className="text-ghost-text">{event.timestamp || 'Not recorded'}</span>
            </div>
            <div>
              <span className="text-ghost-subtle block">Event Classification</span>
              <span className="capitalize text-ghost-text">{event.event_type}</span>
            </div>
            <div>
              <span className="text-ghost-subtle block">Severity</span>
              <span
                className={`uppercase font-bold ${
                  event.severity === 'critical'
                    ? 'text-rose-400'
                    : event.severity === 'high'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {event.severity}
              </span>
            </div>
          </div>}

          {/* Verbatim Raw Log Line */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-ghost-muted uppercase text-[11px] flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                Verbatim Log Trace Evidence
              </span>
              <span className="text-[10px] font-mono text-ghost-subtle">Untrusted Raw Input</span>
            </div>
            <div className="p-3 rounded-lg bg-ghost-bg border border-ghost-border font-mono text-emerald-300 break-all select-all leading-relaxed">
              {evidenceText}
            </div>
          </div>

          {/* Deterministic Indicators */}
          {event?.indicators && event.indicators.length > 0 && (
            <div>
              <span className="font-mono text-ghost-muted uppercase text-[11px] block mb-1.5">
                Deterministic Engine Signals Detected:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.indicators.map((ind) => (
                  <span
                    key={ind}
                    className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 font-mono text-[11px] text-emerald-300"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Narrative Grounding Layer */}
          {keyNarrativeEvent ? (
            <div className="p-3.5 rounded-lg border border-ghost-border bg-ghost-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-ghost-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Narrative Interpretation: "{keyNarrativeEvent.title}"
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    keyNarrativeEvent.is_creative
                      ? 'bg-purple-950/70 border-purple-800 text-purple-300'
                      : 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {keyNarrativeEvent.is_creative ? '✨ Creative Metaphor' : '🔬 Factual Deduction'}
                </span>
              </div>
              <p className="text-ghost-muted leading-relaxed">
                {keyNarrativeEvent.interpretation}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-ghost-panel/60 border border-ghost-border text-ghost-subtle italic">
              This event is part of the deterministic log sequence and provided as context to the AI.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ghost-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border text-xs text-ghost-text transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
