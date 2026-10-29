import React from 'react';
import { X, ShieldCheck, Lock, HardDrive, EyeOff, Terminal } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-ghost-surface border border-ghost-border rounded-xl shadow-2xl p-6 text-ghost-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ghost-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ghost-text">Privacy & Local-First Architecture</h3>
              <p className="text-xs text-ghost-muted">How GhostTrace handles your logs</p>
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
        <div className="py-4 space-y-4 text-xs leading-relaxed text-ghost-muted">
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300">
            <span className="font-semibold block text-sm mb-1 text-emerald-200">
              "Your machine remembers what happened. GhostTrace helps you tell its story."
            </span>
            Terminal logs and developer traces frequently contain proprietary paths, environment names, and sensitive traces. We built GhostTrace from the ground up to protect your privacy.
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-ghost-panel border border-ghost-border">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ghost-text block">Ollama inference at the configured endpoint</span>
                <span>
                  By default, GhostTrace uses Ollama at <code className="font-mono text-emerald-400">http://127.0.0.1:11434</code>. If you change <code className="font-mono text-emerald-400">OLLAMA_BASE_URL</code>, your logs are sent to that configured server. GhostTrace has no fallback to hosted AI providers.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-ghost-panel border border-ghost-border">
              <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ghost-text block">No Automatic Raw Log Storage</span>
                <span>
                  Uploaded or pasted logs exist only in volatile RAM during your analysis cycle. The local SQLite database stores only sessions that you explicitly choose to save.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-ghost-panel border border-ghost-border">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ghost-text block">Zero Telemetry & Offline Ready</span>
                <span>
                  GhostTrace does not configure telemetry or third-party CDN fonts. Once dependencies and model weights are installed, a local Ollama setup can run without internet access.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-ghost-panel border border-ghost-border">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-ghost-text block">Zero Shell Execution</span>
                <span>
                  GhostTrace analyzes logs as passive text. It does not monitor your shell or execute commands found in logs.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-ghost-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
