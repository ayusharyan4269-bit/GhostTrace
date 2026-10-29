import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Upload,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PrivacyModal } from './components/layout/PrivacyModal';
import { TerminalInput } from './components/terminal/TerminalInput';
import { LogUploader } from './components/terminal/LogUploader';
import { ScenarioPicker } from './components/terminal/ScenarioPicker';
import { ModeSelector } from './components/narrative/ModeSelector';
import { StoryControls } from './components/narrative/StoryControls';
import { NarrativeViewer } from './components/narrative/NarrativeViewer';
import { EventTimeline } from './components/timeline/EventTimeline';
import { EvidenceInspector } from './components/evidence/EvidenceInspector';
import { SessionHistoryModal } from './components/sessions/SessionHistoryModal';
import { api } from './services/api';
import { formatNarrativeMarkdown, downloadMarkdownFile } from './utils/markdownExport';
import { redactSensitiveContent } from './utils/secretRedaction';
import {
  HealthResponse,
  ScenarioItem,
  NarrativeMode,
  StoryLength,
  AnalyzeResponse,
  ParsedEvent,
  SessionItem
} from './types';

export const App: React.FC = () => {
  // App state
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'scenarios'>('paste');

  // Input states
  const [logContent, setLogContent] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [narrativeMode, setNarrativeMode] = useState<NarrativeMode>('haunted_chronicle');
  const [storyLength, setStoryLength] = useState<StoryLength>('balanced');
  const [toneAccent, setToneAccent] = useState('');

  // Analysis / Inference states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [selectedEventForInspection, setSelectedEventForInspection] = useState<ParsedEvent | null>(null);
  const [selectedNarrativeEvidence, setSelectedNarrativeEvidence] = useState<import('./types').NarrativeResult['key_events'][number] | null>(null);
  const [pendingRedaction, setPendingRedaction] = useState<{ text: string; count: number } | null>(null);

  // Sessions state
  const [savedSessions, setSavedSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isCurrentSessionSaved, setIsCurrentSessionSaved] = useState(false);

  // UI Modals & Effects
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load initial health, scenarios, and sessions
  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: 'error',
        version: '1.0.0',
        ollama_connected: false,
        ollama_url: 'http://127.0.0.1:11434',
        configured_model: 'qwen2.5:3b',
        model_available: false,
        available_models: [],
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const loadScenarios = async () => {
    try {
      const data = await api.getScenarios();
      setScenarios(data);
      // Pre-select first scenario to make demo immediate
      if (data.length > 0 && !logContent) {
        setLogContent(data[0].log_content);
        setSelectedScenarioId(data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load scenarios', err);
    }
  };

  const loadSavedSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await api.listSessions();
      setSavedSessions(data);
    } catch (err) {
      console.warn('Failed to load sessions', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    loadScenarios();
    loadSavedSessions();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Scenario selection
  const handleSelectScenario = (scenario: ScenarioItem) => {
    setSelectedScenarioId(scenario.id);
    setLogContent(scenario.log_content);
    setActiveTab('paste');
    showToast(`Loaded scenario: "${scenario.title}"`, 'info');
  };

  // File loaded
  const handleFileLoaded = (content: string, filename: string) => {
    setSelectedScenarioId(null);
    setLogContent(content);
    setActiveTab('paste');
    showToast(`Loaded file "${filename}" (${content.split('\n').length} lines)`, 'success');
  };

  const executeAnalysis = async (content: string) => {
    setIsAnalyzing(true);
    try {
      const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);
      const res = await api.analyzeLogs(
        content,
        narrativeMode,
        storyLength,
        toneAccent,
        activeScenario?.title
      );
      setAnalysisResult(res);
      setIsCurrentSessionSaved(false);

      if (res.error) {
        showToast(res.error, 'error');
      } else if (res.redactions_applied) {
        showToast(`${res.redactions_applied} additional possible secret(s) were redacted by the server.`, 'info');
      } else {
        showToast('Narrative synthesized successfully by local model!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Analysis request failed.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Main Analyze Trigger. Keep this zero-argument so React's click event is ignored.
  const handleAnalyze = async () => {
    if (!logContent.trim()) {
      showToast('Please provide terminal output or select a scenario first.', 'error');
      return;
    }

    const redaction = redactSensitiveContent(logContent);
    if (redaction.count > 0) {
      setPendingRedaction(redaction);
      return;
    }
    await executeAnalysis(redaction.text);
  };

  // Save Session
  const handleSaveSession = async () => {
    if (!analysisResult || !analysisResult.narrative) return;
    try {
      await api.createSession({
        title: analysisResult.narrative.title,
        mode: analysisResult.narrative.selected_mode,
        summary: analysisResult.summary,
        narrative: analysisResult.narrative,
        notes: `Analyzed with ${analysisResult.summary.total_lines} lines on ${new Date().toLocaleDateString()}`,
      });
      setIsCurrentSessionSaved(true);
      await loadSavedSessions();
      showToast('Session saved to local SQLite database!', 'success');
    } catch (err: any) {
      showToast(`Failed to save session: ${err.message}`, 'error');
    }
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    if (!analysisResult || !analysisResult.narrative) return;
    const model = analysisResult.generation_metadata?.model || health?.configured_model || 'qwen2.5:3b';
    const md = formatNarrativeMarkdown(analysisResult.narrative, analysisResult.summary, model);
    const filename = `${analysisResult.narrative.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    downloadMarkdownFile(md, filename);
    showToast(`Exported "${filename}"`, 'success');
  };

  // Open saved session from modal
  const handleOpenSavedSession = async (sessionId: string) => {
    try {
      const sess = await api.getSession(sessionId);
      setAnalysisResult({
        success: true,
        summary: sess.summary,
        events: [],
        narrative: sess.narrative,
        generation_metadata: { model: 'Saved Session' },
        error: null,
      });
      setNarrativeMode(sess.mode as NarrativeMode);
      setIsCurrentSessionSaved(true);
      showToast(`Reopened session: "${sess.title}"`, 'success');
    } catch (err: any) {
      showToast(`Failed to open session: ${err.message}`, 'error');
    }
  };

  // Rename session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      await api.updateSession(sessionId, { title: newTitle });
      await loadSavedSessions();
      showToast('Session renamed.', 'success');
    } catch (err: any) {
      showToast(`Failed to rename: ${err.message}`, 'error');
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      await loadSavedSessions();
      showToast('Session deleted.', 'info');
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  // Clear all sessions
  const handleClearAllSessions = async () => {
    try {
      const res = await api.clearAllSessions();
      await loadSavedSessions();
      showToast(`Cleared ${res.cleared_count} sessions.`, 'info');
    } catch (err: any) {
      showToast(`Failed to clear: ${err.message}`, 'error');
    }
  };

  // Find corresponding narrative event when clicking a timeline event
  const handleSelectTimelineEvent = (ev: ParsedEvent) => {
    setSelectedEventForInspection(ev);
    setSelectedNarrativeEvidence(null);
  };

  const matchingKeyNarrativeEvent = selectedEventForInspection
    ? analysisResult?.narrative?.key_events.find((k) => k.event_id === selectedEventForInspection.event_id)
    : null;

  return (
    <div className={`min-h-screen flex flex-col bg-ghost-bg text-ghost-text ${scanlinesEnabled ? 'scanline-overlay' : ''}`}>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-2xl font-mono text-xs animate-slideDown bg-ghost-panel border-ghost-borderHover text-ghost-text">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {pendingRedaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="redaction-title">
          <div className="w-full max-w-2xl rounded-xl border border-amber-700/60 bg-ghost-surface p-5 shadow-2xl space-y-4">
            <div>
              <h2 id="redaction-title" className="font-semibold text-amber-300">Review detected credentials</h2>
              <p className="mt-1 text-xs text-ghost-muted">Found {pendingRedaction.count} possible secret(s). Review the preview; pattern matching can miss custom credentials. Only the redacted preview will be sent for analysis.</p>
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-ghost-border bg-ghost-bg p-3 font-mono text-xs text-ghost-text">{pendingRedaction.text}</pre>
            <div className="flex justify-end gap-2">
              <button className="rounded-lg border border-ghost-border px-3 py-2 text-xs" onClick={() => setPendingRedaction(null)}>Go back</button>
              <button className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-semibold text-white" onClick={() => { const text = pendingRedaction.text; setPendingRedaction(null); void executeAnalysis(text); }}>Analyze redacted logs</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        health={health}
        healthLoading={healthLoading}
        onRefreshHealth={loadHealth}
        savedSessionsCount={savedSessions.length}
        onOpenSessions={() => setIsSessionsOpen(true)}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow space-y-8 w-full">
        {/* Hero Section */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Hacktoberfest 2026 • Ghost in the Machine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-ghost-text">
            Transform Terminal Traces into Haunting Narratives
          </h1>
          <p className="text-sm sm:text-base text-ghost-muted max-w-3xl">
            GhostTrace parses developer command histories, server errors, and system logs deterministically,
            then guides a locally running open-weight language model to craft evidence-grounded stories.
          </p>
        </div>

        {/* Input Method Selector Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-ghost-border pb-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'paste'
                  ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold'
                  : 'text-ghost-muted hover:text-ghost-text'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paste Terminal / Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold'
                  : 'text-ghost-muted hover:text-ghost-text'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Log File</span>
            </button>

            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold'
                  : 'text-ghost-muted hover:text-ghost-text'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Built-in Scenarios</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'paste' && (
            <TerminalInput
              value={logContent}
              onChange={(val) => {
                setLogContent(val);
                setSelectedScenarioId(null);
              }}
              onClear={() => {
                setLogContent('');
                setSelectedScenarioId(null);
              }}
              disabled={isAnalyzing}
            />
          )}

          {activeTab === 'upload' && (
            <LogUploader
              onFileLoaded={handleFileLoaded}
              disabled={isAnalyzing}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenarioPicker
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioId}
              onSelectScenario={handleSelectScenario}
              disabled={isAnalyzing}
            />
          )}
        </div>

        {/* Narrative Mode Selection */}
        <ModeSelector
          selectedMode={narrativeMode}
          onSelectMode={setNarrativeMode}
          disabled={isAnalyzing}
        />

        {/* Parameters & Main Analyze Trigger */}
        <StoryControls
          length={storyLength}
          onChangeLength={setStoryLength}
          tone={toneAccent}
          onChangeTone={setToneAccent}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={!logContent.trim()}
          modelReady={health?.model_available ?? false}
          modelName={health?.configured_model || 'qwen2.5:3b'}
        />

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="space-y-8 pt-4">
            {/* If Ollama was offline or error occurred during AI generation */}
            {analysisResult.error && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-mono font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Log Parsing Succeeded · Narrative Generation Unavailable</span>
                </div>
                <p className="text-xs text-amber-400/90 leading-relaxed">
                  {analysisResult.error}
                </p>
                <div className="p-2.5 rounded bg-black/50 font-mono text-[11px] text-ghost-muted">
                  Log lines and timeline events below were extracted deterministically. Check the Ollama status and configured endpoint, then retry narrative generation.
                </div>
              </div>
            )}

            {/* Generated Narrative Presentation */}
            {analysisResult.narrative && (
              <NarrativeViewer
                narrative={analysisResult.narrative}
                summary={analysisResult.summary}
                generationMetadata={analysisResult.generation_metadata}
                onSaveSession={handleSaveSession}
                onExportMarkdown={handleExportMarkdown}
                onRegenerate={handleAnalyze}
                onSelectKeyEvent={(ke) => {
                  const matchingEv = analysisResult.events.find((e) => e.event_id === ke.event_id);
                  if (matchingEv) {
                    setSelectedEventForInspection(matchingEv);
                    setSelectedNarrativeEvidence(null);
                  } else {
                    setSelectedEventForInspection(null);
                    setSelectedNarrativeEvidence(ke);
                  }
                }}
                isSaved={isCurrentSessionSaved}
              />
            )}

            {/* Deterministic Timeline & Summary */}
            {analysisResult.summary && analysisResult.events && analysisResult.events.length > 0 && (
              <EventTimeline
                summary={analysisResult.summary}
                events={analysisResult.events}
                keyNarrativeEvents={analysisResult.narrative?.key_events}
                onSelectEvent={handleSelectTimelineEvent}
              />
            )}
          </div>
        )}
      </main>

      {/* Evidence Inspector Modal */}
      <EvidenceInspector
        event={selectedEventForInspection}
        keyNarrativeEvent={matchingKeyNarrativeEvent ?? selectedNarrativeEvidence}
        onClose={() => { setSelectedEventForInspection(null); setSelectedNarrativeEvidence(null); }}
      />

      {/* Saved Sessions History Modal */}
      <SessionHistoryModal
        isOpen={isSessionsOpen}
        onClose={() => setIsSessionsOpen(false)}
        sessions={savedSessions}
        onOpenSession={handleOpenSavedSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        loading={sessionsLoading}
      />

      {/* Privacy Guarantee Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
