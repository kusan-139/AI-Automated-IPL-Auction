const PRODUCTION_API = 'https://ai-automated-ipl-auction-production.up.railway.app/api/v1';
const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : PRODUCTION_API);
// Force https in production to prevent mixed-content blocking
const API_BASE_URL = rawUrl.replace(/\/+$/, '').replace(/^http:\/\/(?!localhost)/, 'https://');

console.log('[API] Base URL:', API_BASE_URL);

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[API] Fetching:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('[API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[API] Error body:', errorBody);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses (like 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('[API] Fetch failed for', url, err);
    throw err;
  }
}
