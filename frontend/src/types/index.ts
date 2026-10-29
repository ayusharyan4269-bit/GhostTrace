export type NarrativeMode = 'haunted_chronicle' | 'digital_seance' | 'forensic_detective' | 'lost_memory';

export type StoryLength = 'concise' | 'balanced' | 'epic';

export interface ParsedEvent {
  event_id: string;
  line_number: number;
  timestamp: string | null;
  event_type: 'command' | 'error' | 'warning' | 'process' | 'network' | 'file_io' | 'info' | string;
  raw_text: string;
  normalized_summary: string;
  indicators: string[];
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
}

export interface LogSummary {
  total_lines: number;
  extracted_events_count: number;
  errors_count: number;
  warnings_count: number;
  commands_count: number;
  detected_patterns: string[];
  time_range: string | null;
  format_detected: string;
  parsing_notes: string[];
}

export interface KeyNarrativeEvent {
  event_id: string;
  title: string;
  log_evidence: string;
  line_reference: number | null;
  interpretation: string;
  is_creative: boolean;
}

export interface CreativeInterpretation {
  aspect: string;
  factual_basis: string;
  creative_layer: string;
}

export interface NarrativeResult {
  title: string;
  selected_mode: NarrativeMode | string;
  opening: string;
  narrative: string;
  key_events: KeyNarrativeEvent[];
  creative_interpretations: CreativeInterpretation[];
  uncertainties: string[];
  closing_line: string;
}

export interface AnalyzeResponse {
  success: boolean;
  summary: LogSummary;
  events: ParsedEvent[];
  narrative: NarrativeResult | null;
  generation_metadata: Record<string, any>;
  error: string | null;
  redactions_applied?: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  ollama_connected: boolean;
  ollama_url: string;
  configured_model: string;
  model_available: boolean;
  available_models: string[];
}

export interface ModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
  parameter_size?: string;
}

export interface ModelsResponse {
  configured_model: string;
  ollama_connected: boolean;
  models: ModelInfo[];
}

export interface ScenarioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  log_content: string;
}

export interface SessionItem {
  session_id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  events_count: number;
  errors_count: number;
  notes?: string | null;
}

export interface SessionDetailResponse {
  session_id: string;
  title: string;
  mode: string;
  created_at: string;
  updated_at: string;
  summary: LogSummary;
  narrative: NarrativeResult;
  notes?: string | null;
}
