import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Terminal,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { ParsedEvent, LogSummary, KeyNarrativeEvent } from '../../types';

interface EventTimelineProps {
  summary: LogSummary;
  events: ParsedEvent[];
  keyNarrativeEvents?: KeyNarrativeEvent[];
  onSelectEvent: (event: ParsedEvent) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  summary,
  events,
  keyNarrativeEvents = [],
  onSelectEvent,
}) => {
  const [filter, setFilter] = useState<'all' | 'errors' | 'commands' | 'process'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const keyEventIds = new Set(keyNarrativeEvents.map((k) => k.event_id));

  const filteredEvents = events.filter((ev) => {
    if (filter === 'errors' && ev.event_type !== 'error' && ev.severity === 'low') return false;
    if (filter === 'commands' && ev.event_type !== 'command') return false;
    if (filter === 'process' && ev.event_type !== 'process') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.raw_text.toLowerCase().includes(q) ||
        ev.normalized_summary.toLowerCase().includes(q) ||
        ev.event_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="rounded-xl border border-ghost-border bg-ghost-surface/80 overflow-hidden shadow-lg space-y-4 p-5">
      {/* Header & Metrics Summary */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ghost-border">
          <div>
            <h3 className="text-sm font-semibold font-mono text-ghost-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              DETERMINISTIC EVENT SEQUENCE
            </h3>
            <p className="text-xs text-ghost-muted">
              {summary.extracted_events_count} events deterministically extracted without AI hallucination
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-ghost-panel border border-ghost-border text-ghost-muted">
              {summary.total_lines} lines
            </span>
            {summary.errors_count > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {summary.errors_count} errors
              </span>
            )}
            {summary.warnings_count > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {summary.warnings_count} warnings
              </span>
            )}
            {summary.commands_count > 0 && (
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                {summary.commands_count} commands
              </span>
            )}
          </div>
        </div>

        {/* Detected Deterministic Patterns Banner */}
        {summary.detected_patterns && summary.detected_patterns.length > 0 && (
          <div className="p-3 rounded-lg bg-ghost-panel border border-ghost-border space-y-1.5">
            <span className="text-[10px] font-mono text-ghost-subtle uppercase tracking-wider block">
              Observed Patterns & Sequence Anomalies:
            </span>
            <div className="flex flex-wrap gap-2">
              {summary.detected_patterns.map((pat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-ghost-card border border-ghost-borderHover font-mono text-xs text-emerald-300"
                >
                  ⚡ {pat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-ghost-panel border border-ghost-border text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-emerald-600 text-white font-semibold' : 'text-ghost-muted hover:text-ghost-text'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'errors' ? 'bg-rose-600 text-white font-semibold' : 'text-ghost-muted hover:text-ghost-text'
            }`}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter('commands')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'commands' ? 'bg-emerald-600 text-white font-semibold' : 'text-ghost-muted hover:text-ghost-text'
            }`}
          >
            Commands
          </button>
          <button
            onClick={() => setFilter('process')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'process' ? 'bg-purple-600 text-white font-semibold' : 'text-ghost-muted hover:text-ghost-text'
            }`}
          >
            Processes
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ghost-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="pl-8 pr-3 py-1 rounded-lg bg-ghost-panel border border-ghost-border text-xs font-mono text-ghost-text placeholder:text-ghost-subtle focus:outline-none focus:border-emerald-500 w-full sm:w-48"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-ghost-subtle">
            No events match the selected criteria.
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isAnchoredInStory = keyEventIds.has(ev.event_id);
            return (
              <div
                key={ev.event_id}
                onClick={() => onSelectEvent(ev)}
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  ev.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                    : ev.severity === 'high'
                    ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-700'
                    : ev.event_type === 'command'
                    ? 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700'
                    : 'bg-ghost-panel/70 border-ghost-border hover:border-ghost-borderHover hover:bg-ghost-card'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Event ID badge */}
                  <span className="px-1.5 py-0.5 rounded bg-ghost-card border border-ghost-border text-[10px] text-ghost-muted shrink-0">
                    {ev.event_id}
                  </span>

                  {/* Line Number */}
                  <span className="text-ghost-subtle text-[11px] shrink-0">
                    #{ev.line_number}
                  </span>

                  {/* Timestamp if present */}
                  {ev.timestamp && (
                    <span className="text-ghost-muted text-[11px] shrink-0 hidden md:inline">
                      [{ev.timestamp}]
                    </span>
                  )}

                  {/* Summary / Snippet */}
                  <span className="text-ghost-text truncate group-hover:text-emerald-300 transition-colors">
                    {ev.normalized_summary}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAnchoredInStory && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] text-emerald-300 font-bold hidden sm:inline">
                      ✨ Story Anchor
                    </span>
                  )}
                  <ExternalLink className="w-3.5 h-3.5 text-ghost-subtle group-hover:text-ghost-text" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
