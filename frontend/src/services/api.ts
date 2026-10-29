import {
  HealthResponse,
  ModelsResponse,
  ScenarioItem,
  AnalyzeResponse,
  NarrativeMode,
  StoryLength,
  SessionItem,
  SessionDetailResponse
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<HealthResponse>(res);
  },

  async getModels(): Promise<ModelsResponse> {
    const res = await fetch(`${BASE_URL}/models`);
    return handleResponse<ModelsResponse>(res);
  },

  async getScenarios(): Promise<ScenarioItem[]> {
    const res = await fetch(`${BASE_URL}/scenarios`);
    return handleResponse<ScenarioItem[]>(res);
  },

  async analyzeLogs(
    logContent: string,
    mode: NarrativeMode,
    storyLength: StoryLength = 'balanced',
    toneAccent?: string,
    scenarioName?: string
  ): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        log_content: logContent,
        mode,
        story_length: storyLength,
        tone_accent: toneAccent || undefined,
        scenario_name: scenarioName || undefined,
      }),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  async listSessions(): Promise<SessionItem[]> {
    const res = await fetch(`${BASE_URL}/sessions`);
    return handleResponse<SessionItem[]>(res);
  },

  async getSession(sessionId: string): Promise<SessionDetailResponse> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    return handleResponse<SessionDetailResponse>(res);
  },

  async createSession(payload: {
    title: string;
    mode: string;
    summary: any;
    narrative: any;
    notes?: string;
  }): Promise<SessionDetailResponse> {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<SessionDetailResponse>(res);
  },

  async updateSession(
    sessionId: string,
    payload: { title?: string; notes?: string }
  ): Promise<SessionDetailResponse> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<SessionDetailResponse>(res);
  },

  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async clearAllSessions(): Promise<{ success: boolean; cleared_count: number }> {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; cleared_count: number }>(res);
  },
};
