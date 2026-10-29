import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Edit2,
  FolderOpen,
  Calendar,
  Check
} from 'lucide-react';
import { SessionItem } from '../../types';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionItem[];
  onOpenSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  loading: boolean;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onOpenSession,
  onRenameSession,
  onDeleteSession,
  onClearAllSessions,
  loading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  if (!isOpen) return null;

  const handleStartRename = (session: SessionItem) => {
    setEditingId(session.session_id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-ghost-surface border border-ghost-border rounded-xl shadow-2xl p-6 text-ghost-text max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ghost-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-ghost-panel border border-ghost-border text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ghost-text">Saved Session History</h3>
              <p className="text-xs text-ghost-muted">Stored in local SQLite database • Raw logs are never saved</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ghost-muted hover:text-ghost-text hover:bg-ghost-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="py-4 overflow-y-auto space-y-3 flex-grow pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-ghost-muted">
              Loading saved sessions from SQLite...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <History className="w-8 h-8 mx-auto text-ghost-subtle" />
              <p className="text-sm font-medium text-ghost-text">No Saved Sessions Yet</p>
              <p className="text-xs text-ghost-muted max-w-sm mx-auto">
                Generate a story and click "Save Session" to persist narratives in local SQLite.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isEditing = editingId === sess.session_id;
              const formattedDate = new Date(sess.created_at).toLocaleString();

              return (
                <div
                  key={sess.session_id}
                  className="p-4 rounded-xl border border-ghost-border bg-ghost-panel hover:bg-ghost-card transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-grow">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="px-2 py-1 rounded bg-ghost-bg border border-emerald-500 font-mono text-xs text-ghost-text focus:outline-none w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(sess.session_id)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded hover:bg-ghost-border text-ghost-muted"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-ghost-text group-hover:text-emerald-300 transition-colors">
                            {sess.title}
                          </h4>
                          <button
                            onClick={() => handleStartRename(sess)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-ghost-subtle hover:text-ghost-text transition-opacity"
                            title="Rename session"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-ghost-subtle">
                        <span className="px-2 py-0.5 rounded bg-ghost-card border border-ghost-border text-ghost-muted uppercase text-[10px]">
                          {sess.mode.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span>{sess.events_count} events</span>
                        {sess.errors_count > 0 && (
                          <span className="text-rose-400 font-semibold">
                            ({sess.errors_count} errors)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onOpenSession(sess.session_id);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Reopen
                      </button>

                      <button
                        onClick={() => onDeleteSession(sess.session_id)}
                        className="p-1.5 rounded-lg text-ghost-subtle hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ghost-border flex justify-between items-center shrink-0">
          {sessions.length > 0 && (
            <div>
              {confirmClearAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-mono">Confirm clear all?</span>
                  <button
                    onClick={() => {
                      onClearAllSessions();
                      setConfirmClearAll(false);
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="px-2 py-1 rounded bg-ghost-panel text-xs text-ghost-muted"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  className="text-xs font-mono text-ghost-subtle hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border text-xs text-ghost-text transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
