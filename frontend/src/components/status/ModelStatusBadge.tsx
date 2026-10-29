import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, X, RefreshCw } from 'lucide-react';
import { HealthResponse } from '../../types';

interface ModelStatusBadgeProps {
  health: HealthResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const ModelStatusBadge: React.FC<ModelStatusBadgeProps> = ({ health, loading, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);

  const isConnected = health?.ollama_connected ?? false;
  const isModelReady = health?.model_available ?? false;
  const ollamaUrl = health?.ollama_url || 'http://127.0.0.1:11434';
  const isLocalEndpoint = (() => {
    try {
      return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(ollamaUrl).hostname);
    } catch {
      return false;
    }
  })();

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all border bg-ghost-panel hover:bg-ghost-card border-ghost-border hover:border-ghost-borderHover"
        title="Click to view local inference & privacy details"
      >
        <span className="relative flex h-2 w-2">
          {isConnected && isModelReady ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : isConnected ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          )}
        </span>

        <span className="text-ghost-muted">
          {loading ? (
            'Checking AI...'
          ) : isConnected && isModelReady ? (
            <span className="text-emerald-400 font-semibold">{health?.configured_model} ({isLocalEndpoint ? 'Local' : 'Remote'})</span>
          ) : isConnected ? (
            <span className="text-amber-400">Model missing</span>
          ) : (
            <span className="text-rose-400">Ollama Offline</span>
          )}
        </span>
      </button>

      {/* Info Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-ghost-surface border border-ghost-border rounded-xl shadow-2xl p-6 text-ghost-text">
            <div className="flex items-center justify-between pb-4 border-b border-ghost-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ghost-text">Local AI Inference Engine</h3>
                  <p className="text-xs text-ghost-muted">{isLocalEndpoint ? 'Local Ollama endpoint' : 'Remote Ollama endpoint'} · No hosted AI provider configured</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-ghost-muted hover:text-ghost-text hover:bg-ghost-panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-ghost-panel border border-ghost-border font-mono">
                <div>
                  <span className="text-ghost-subtle block">Runtime</span>
                  <span className="text-ghost-text">Ollama ({isLocalEndpoint ? 'Local' : 'Remote'})</span>
                </div>
                <div>
                  <span className="text-ghost-subtle block">Endpoint</span>
                  <span className="text-ghost-text">{health?.ollama_url || 'http://127.0.0.1:11434'}</span>
                </div>
                <div>
                  <span className="text-ghost-subtle block">Configured Model</span>
                  <span className="text-emerald-400 font-medium">{health?.configured_model || 'qwen2.5:3b'}</span>
                </div>
                <div>
                  <span className="text-ghost-subtle block">Model Installed</span>
                  <span className={isModelReady ? 'text-emerald-400' : 'text-rose-400'}>
                    {isModelReady ? 'Ready (Installed)' : 'Not Found'}
                  </span>
                </div>
              </div>

              {isConnected && isModelReady && isLocalEndpoint ? (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-medium">Local-first privacy active</p>
                    <p className="text-emerald-400/80 mt-0.5">
                      Logs are sent to the Ollama endpoint shown above for inference. With a loopback endpoint, inference stays on this machine; GhostTrace does not configure a hosted AI provider or telemetry.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium">Ollama setup needed for AI generation</p>
                    <p className="text-amber-400/80 mt-1">
                      Deterministic log parsing still works without AI. Check the Ollama endpoint and model, then start the local service and install the model if needed:
                    </p>
                    <div className="mt-2 p-2 rounded bg-black/60 font-mono text-[11px] text-ghost-text">
                      <p className="text-ghost-muted"># 1. Start Ollama</p>
                      <p>ollama serve</p>
                      <p className="text-ghost-muted mt-1"># 2. Pull the default open-weight model</p>
                      <p>ollama pull qwen2.5:3b</p>
                      <p className="text-ghost-muted mt-2"># Optional: try Gemma 3 4B (Ollama 0.6+)</p>
                      <p>ollama pull gemma3:4b</p>
                      <p className="mt-1 text-ghost-muted">Set OLLAMA_MODEL=gemma3:4b in backend/.env, then restart the backend.</p>
                    </div>
                  </div>
                </div>
              )}

              {isConnected && isModelReady && !isLocalEndpoint && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium">Remote inference endpoint</p>
                    <p className="text-amber-400/80 mt-0.5">
                      GhostTrace sends your logs to the configured Ollama server at the endpoint above. Confirm that you trust its operator before analyzing sensitive logs.
                    </p>
                  </div>
                </div>
              )}

              {health?.available_models && health.available_models.length > 0 && (
                <div className="pt-2">
                  <span className="text-ghost-muted block mb-1">Available Local Models:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {health.available_models.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-ghost-panel border border-ghost-border font-mono text-[11px] text-ghost-muted"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-ghost-border flex justify-between items-center">
              <button
                onClick={onRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ghost-panel hover:bg-ghost-card border border-ghost-border text-xs text-ghost-muted hover:text-ghost-text transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-check Status
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
