// ─── Shared API Utility ──────────────────────────────────────────────────────
// Centralizes backend communication so every page uses the same base URL,
// auth header injection, and JSON parsing logic.

const API_BASE = 'http://localhost:5000';

/** Read the JWT stored at login time */
export function getToken() {
  return localStorage.getItem('token');
}

/** Build the Authorization header object */
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Wrapper around fetch() that:
 *  1. Prepends API_BASE to the path
 *  2. Injects the JWT auth header automatically
 *  3. Parses the JSON response
 *  4. Throws on non-2xx status codes
 *
 * @param {string} path  – e.g. '/api/exams'
 * @param {object} opts  – standard fetch options (method, body, headers, …)
 * @returns {Promise<any>} parsed JSON body
 */
export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...opts.headers,
    },
  });

  // Try to parse the body regardless of status so callers get error messages
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export function assignExamAPI(examId, assignmentData) {
  return apiFetch(`/api/exams/${examId}/assign`, {
    method: 'POST',
    body: JSON.stringify(assignmentData)
  });
}
