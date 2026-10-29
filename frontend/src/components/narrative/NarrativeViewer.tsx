import React from 'react';
import {
  Download,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  Quote,
  CheckCircle2
} from 'lucide-react';
import { NarrativeResult, LogSummary, KeyNarrativeEvent } from '../../types';

interface NarrativeViewerProps {
  narrative: NarrativeResult;
  summary?: LogSummary;
  generationMetadata: Record<string, any>;
  onSaveSession: () => void;
  onExportMarkdown: () => void;
  onRegenerate: () => void;
  onSelectKeyEvent: (event: KeyNarrativeEvent) => void;
  isSaved?: boolean;
}

export const NarrativeViewer: React.FC<NarrativeViewerProps> = ({
  narrative,
  generationMetadata,
  onSaveSession,
  onExportMarkdown,
  onRegenerate,
  onSelectKeyEvent,
  isSaved = false,
}) => {
  const modelName = generationMetadata?.model || 'qwen2.5:3b';
  const durationSec = generationMetadata?.inference_duration_sec;
  const evalCount = generationMetadata?.eval_count;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Actions Card */}
      <div className="p-6 rounded-2xl border border-ghost-border bg-gradient-to-b from-ghost-panel to-ghost-surface shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ghost-border/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 font-mono text-[11px] text-emerald-300 uppercase tracking-wider font-semibold">
              {narrative.selected_mode.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-ghost-subtle flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              {modelName} {durationSec ? `(${durationSec}s${evalCount ? ` • ${evalCount} tokens` : ''})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSaveSession}
              disabled={isSaved}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
                isSaved
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300 cursor-default'
                  : 'bg-ghost-panel hover:bg-ghost-card border-ghost-border text-ghost-text hover:border-ghost-borderHover'
              }`}
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isSaved ? 'Saved to SQLite' : 'Save Session'}</span>
            </button>

            <button
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border hover:border-ghost-borderHover font-mono text-xs text-ghost-text transition-colors"
              title="Download Markdown narrative"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .md</span>
            </button>

            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border text-ghost-muted hover:text-ghost-text transition-colors"
              title="Regenerate story"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative Title & Cold Open */}
        <div className="pt-5 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ghost-text font-serif">
            {narrative.title}
          </h2>

          <div className="p-3.5 rounded-lg bg-ghost-bg/70 border-l-2 border-emerald-500 italic text-ghost-muted text-sm sm:text-base leading-relaxed">
            "{narrative.opening}"
          </div>
        </div>

        {/* Main Narrative Body */}
        <p className="pt-4 text-[11px] font-mono text-ghost-subtle">
          AI-generated narrative: verify technical claims against the cited log evidence; atmospheric details are creative.
        </p>
        <div className="pt-4 space-y-4 text-ghost-text/90 leading-relaxed text-sm sm:text-base whitespace-pre-line font-sans">
          {narrative.narrative.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="leading-relaxed">
              {paragraph.split(/(\[evt_\d+\])/g).map((part, partIdx) => {
                const eventId = part.match(/^\[(evt_\d+)\]$/)?.[1];
                const event = eventId && narrative.key_events.find((item) => item.event_id === eventId);
                return event ? (
                  <button key={partIdx} type="button" onClick={() => onSelectKeyEvent(event)} className="mx-0.5 rounded border border-emerald-800 px-1 font-mono text-[0.8em] text-emerald-300 hover:bg-emerald-950" aria-label={`Inspect evidence ${event.event_id}`}>
                    {part}
                  </button>
                ) : <React.Fragment key={partIdx}>{part}</React.Fragment>;
              })}
            </p>
          ))}
        </div>

        {/* Memorable Closing Line */}
        {narrative.closing_line && (
          <div className="mt-6 pt-4 border-t border-ghost-border/60 flex items-start gap-3">
            <Quote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <blockquote className="font-mono text-xs sm:text-sm text-emerald-300 font-medium italic">
              {narrative.closing_line}
            </blockquote>
          </div>
        )}
      </div>

      {/* Grounded Key Events Section */}
      {narrative.key_events && narrative.key_events.length > 0 && (
        <div className="p-5 rounded-xl border border-ghost-border bg-ghost-surface space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ghost-border">
            <h3 className="text-sm font-semibold font-mono text-ghost-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              GROUNDED NARRATIVE ANCHORS
            </h3>
            <span className="text-[11px] font-mono text-ghost-subtle">
              Click event to inspect original log trace
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {narrative.key_events.map((ke, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectKeyEvent(ke)}
                className="w-full text-left p-3 rounded-lg border border-ghost-border bg-ghost-panel hover:bg-ghost-card hover:border-ghost-borderHover transition-all cursor-pointer space-y-2 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-xs text-ghost-text group-hover:text-emerald-300 transition-colors">
                    {ke.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      ke.is_creative
                        ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {ke.is_creative ? '✨ Creative' : '🔬 Factual'}
                  </span>
                </div>

                <div className="p-2 rounded bg-ghost-bg font-mono text-[11px] text-emerald-400/90 truncate">
                  {ke.line_reference && <span className="text-ghost-subtle mr-1.5">#{ke.line_reference}</span>}
                  {ke.log_evidence}
                </div>

                <p className="text-xs text-ghost-muted line-clamp-2">
                  {ke.interpretation}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Creative Metaphor vs Factual Trace Breakdown */}
      {narrative.creative_interpretations && narrative.creative_interpretations.length > 0 && (
        <div className="p-5 rounded-xl border border-ghost-border bg-ghost-surface space-y-3">
          <div className="pb-2 border-b border-ghost-border">
            <h3 className="text-sm font-semibold font-mono text-ghost-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              CREATIVE METAPHOR VS. FACTUAL EVIDENCE
            </h3>
            <p className="text-xs text-ghost-muted">
              Transparent separation showing how the AI transformed real signals into theme elements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {narrative.creative_interpretations.map((ci, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-ghost-border bg-ghost-panel space-y-2">
                <span className="font-mono font-bold text-xs text-purple-300 block">
                  {ci.aspect}
                </span>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-ghost-subtle font-mono text-[10px] block">FACTUAL LOG BASIS:</span>
                    <span className="text-ghost-text">{ci.factual_basis}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-ghost-subtle font-mono text-[10px] block">CREATIVE REIMAGINING:</span>
                    <span className="text-purple-200/90 italic">{ci.creative_layer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unresolved Uncertainties */}
      {narrative.uncertainties && narrative.uncertainties.length > 0 && (
        <div className="p-4 rounded-xl border border-ghost-border bg-ghost-panel space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
            <HelpCircle className="w-4 h-4" />
            <span>UNRESOLVED TECHNICAL MYSTERIES</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-ghost-muted">
            {narrative.uncertainties.map((unc, idx) => (
              <li key={idx}>{unc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
