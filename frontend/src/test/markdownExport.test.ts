import { describe, it, expect } from 'vitest';
import { formatNarrativeMarkdown } from '../utils/markdownExport';
import { NarrativeResult, LogSummary } from '../types';

describe('formatNarrativeMarkdown', () => {
  it('formats markdown with grounding evidence, metrics, and closing line', () => {
    const mockSummary: LogSummary = {
      total_lines: 10,
      extracted_events_count: 8,
      errors_count: 2,
      warnings_count: 1,
      commands_count: 1,
      detected_patterns: ['Process restart loop'],
      time_range: '02:14:01 -> 02:14:10',
      format_detected: 'plain_text',
      parsing_notes: [],
    };

    const mockNarrative: NarrativeResult = {
      title: 'The Haunting of Worker 3',
      selected_mode: 'haunted_chronicle',
      opening: 'Midnight struck the system daemon.',
      narrative: 'A long story about the ghost in the server.',
      key_events: [
        {
          event_id: 'evt_001',
          title: 'Memory Mapping Failure',
          log_evidence: 'ERROR Failed to acquire lockfile',
          line_reference: 4,
          interpretation: 'The lock was held by a ghost',
          is_creative: false,
        },
      ],
      creative_interpretations: [
        {
          aspect: 'The Spectral Daemon',
          factual_basis: 'spectral-daemon service log',
          creative_layer: 'A wandering digital shade',
        },
      ],
      uncertainties: ['Origin of the orphaned PID'],
      closing_line: 'The terminal fell silent.',
    };

    const md = formatNarrativeMarkdown(mockNarrative, mockSummary, 'qwen2.5:3b');

    expect(md).toContain('# The Haunting of Worker 3');
    expect(md).toContain('**Mode:** haunted_chronicle');
    expect(md).toContain('**Model:** qwen2.5:3b');
    expect(md).toContain('Midnight struck the system daemon.');
    expect(md).toContain('A long story about the ghost in the server.');
    expect(md).toContain('The terminal fell silent.');
    expect(md).toContain('Total Lines Processed:** 10');
    expect(md).toContain('Process restart loop');
    expect(md).toContain('Memory Mapping Failure');
    expect(md).toContain('ERROR Failed to acquire lockfile');
    expect(md).toContain('The Spectral Daemon');
    expect(md).toContain('Origin of the orphaned PID');
  });
});
