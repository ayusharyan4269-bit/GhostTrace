import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getHealth: vi.fn(),
    getScenarios: vi.fn(),
    listSessions: vi.fn(),
    analyzeLogs: vi.fn(),
    createSession: vi.fn(),
    getSession: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    clearAllSessions: vi.fn(),
  },
}));

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.getHealth as any).mockResolvedValue({
      status: 'ok',
      version: '1.0.0',
      ollama_connected: true,
      ollama_url: 'http://127.0.0.1:11434',
      configured_model: 'qwen2.5:3b',
      model_available: true,
      available_models: ['qwen2.5:3b'],
    });

    (api.getScenarios as any).mockResolvedValue([
      {
        id: 'midnight_process',
        title: 'The Midnight Process',
        subtitle: 'Daemon terminates at 02:14 AM',
        description: 'Test scenario description',
        log_content: '[02:14:04] ERROR Lock acquisition failure\n[02:14:05] FATAL SIGKILL received',
      },
      {
        id: 'forgotten_server',
        title: 'The Forgotten Server',
        subtitle: 'Server errors',
        description: 'Forgotten server test',
        log_content: 'HTTP 503 Service Unavailable',
      },
    ]);

    (api.listSessions as any).mockResolvedValue([]);
  });

  it('renders application title, brand, and connected model status badge', async () => {
    render(<App />);

    expect(screen.getAllByText(/GHOST/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/v1\.0 Local AI/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/qwen2.5:3b \(Local\)/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Transform Terminal Traces into Haunting Narratives/i)
    ).toBeInTheDocument();
  });

  it('labels a non-loopback Ollama endpoint as remote', async () => {
    (api.getHealth as any).mockResolvedValue({
      status: 'ok',
      version: '1.0.0',
      ollama_connected: true,
      ollama_url: 'https://ollama.example.test',
      configured_model: 'gemma3:4b',
      model_available: true,
      available_models: ['gemma3:4b'],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('gemma3:4b (Remote)')).toBeInTheDocument();
    });
  });

  it('loads built-in scenarios into the terminal buffer', async () => {
    render(<App />);

    // Switch to Scenarios tab
    const scenariosTabBtn = screen.getByRole('button', { name: /Built-in Scenarios/i });
    fireEvent.click(scenariosTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/The Midnight Process/i)).toBeInTheDocument();
    });

    // Select the scenario
    const selectBtn = screen.getByRole('button', { name: /The Midnight Process/i });
    fireEvent.click(selectBtn);

    // Switch back to paste tab to verify content
    const pasteTabBtn = screen.getByRole('button', { name: /Paste Terminal \/ Logs/i });
    fireEvent.click(pasteTabBtn);

    const textarea = screen.getByPlaceholderText(/Paste terminal output/i);
    expect(textarea).toHaveValue('[02:14:04] ERROR Lock acquisition failure\n[02:14:05] FATAL SIGKILL received');
  });

  it('handles analysis trigger and renders synthesized narrative and grounded anchors', async () => {
    (api.analyzeLogs as any).mockResolvedValue({
      success: true,
      summary: {
        total_lines: 2,
        extracted_events_count: 2,
        errors_count: 2,
        warnings_count: 0,
        commands_count: 0,
        detected_patterns: ['Process restart loop'],
        time_range: '02:14:04 -> 02:14:05',
        format_detected: 'plain_text',
        parsing_notes: [],
      },
      events: [
        {
          event_id: 'evt_001',
          line_number: 1,
          timestamp: '02:14:04',
          event_type: 'error',
          raw_text: '[02:14:04] ERROR Lock acquisition failure',
          normalized_summary: 'Lock acquisition failure',
          indicators: ['error_detected'],
          severity: 'high',
        },
      ],
      narrative: {
        title: 'The Spectral Daemon of Midnight',
        selected_mode: 'haunted_chronicle',
        opening: 'The machine clocks struck two hours and fourteen minutes.',
        narrative: 'A phantom process stirred in the deep memory buffers...',
        key_events: [
          {
            event_id: 'evt_001',
            title: 'Unreachable Lockfile',
            log_evidence: '[02:14:04] ERROR Lock acquisition failure',
            line_reference: 1,
            interpretation: 'The daemon encountered a spectral obstacle',
            is_creative: true,
          },
        ],
        creative_interpretations: [
          {
            aspect: 'The Lockfile',
            factual_basis: 'Lock acquisition failure',
            creative_layer: 'An eternal boundary',
          },
        ],
        uncertainties: ['Who created the lockfile?'],
        closing_line: 'And the thread returned to dust.',
      },
      generation_metadata: {
        model: 'qwen2.5:3b',
        inference_duration_sec: 12.4,
        eval_count: 450,
      },
      error: null,
    });

    render(<App />);

    // Find and click the summon button
    const summonBtn = await screen.findByRole('button', { name: /Analyze & Summon Story/i });
    fireEvent.click(summonBtn);
    expect(api.analyzeLogs).toHaveBeenCalledWith(
      expect.any(String),
      'haunted_chronicle',
      'balanced',
      '',
      'The Midnight Process'
    );

    await waitFor(() => {
      expect(screen.getByText('The Spectral Daemon of Midnight')).toBeInTheDocument();
      expect(screen.getByText(/The machine clocks struck two hours/i)).toBeInTheDocument();
      expect(screen.getByText(/A phantom process stirred/i)).toBeInTheDocument();
      expect(screen.getByText('And the thread returned to dust.')).toBeInTheDocument();
    });

    // Check that grounded narrative anchor is shown
    expect(screen.getByText('Unreachable Lockfile')).toBeInTheDocument();
    expect(screen.getByText('✨ Creative')).toBeInTheDocument();
  });

  it('renders Ollama offline warning and setup instructions when Ollama is unavailable', async () => {
    (api.getHealth as any).mockResolvedValue({
      status: 'ok',
      version: '1.0.0',
      ollama_connected: false,
      ollama_url: 'http://127.0.0.1:11434',
      configured_model: 'qwen2.5:3b',
      model_available: false,
      available_models: [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ollama Offline/i)).toBeInTheDocument();
    });
  });
});
