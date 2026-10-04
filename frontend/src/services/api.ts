import type { ApiResponse, ApiError } from '../types';

// API base URL is configured via VITE_API_BASE_URL environment variable.
// For local development: set VITE_API_BASE_URL=http://localhost:8000 in frontend/.env
// For production: set VITE_API_BASE_URL=https://your-deployed-backend.com
// The LLM API key lives exclusively on the backend — never here.
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8000';


export async function analyzeContent(content: string): Promise<ApiResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    const error: ApiError = {
      type: 'network',
      message: 'Unable to reach SENTINEL backend.',
      details: `Make sure the backend is running at ${API_BASE_URL}.`,
    };
    throw error;
  }

  // Handle HTTP validation errors
  if (response.status === 422) {
    let detail = 'Please check your input and try again.';
    try {
      const body = await response.json();
      if (body.detail?.[0]?.msg) detail = body.detail[0].msg;
    } catch {}
    const error: ApiError = {
      type: 'validation',
      message: 'Validation error',
      details: detail,
    };
    throw error;
  }

  if (response.status === 400) {
    let detail = 'Invalid request.';
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
      if (body.message) detail = body.message;
    } catch {}
    const error: ApiError = {
      type: 'validation',
      message: detail,
    };
    throw error;
  }

  if (!response.ok) {
    const error: ApiError = {
      type: 'server',
      message: 'The analysis service returned an error.',
      details: `HTTP ${response.status}`,
    };
    throw error;
  }

  try {
    const data = await response.json();
    return data as ApiResponse;
  } catch {
    const error: ApiError = {
      type: 'parse',
      message: 'Received an unexpected response from the backend.',
    };
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE_URL}/api/v1/health`);
    return r.ok;
  } catch {
    return false;
  }
}
