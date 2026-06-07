// A thin fetch wrapper that:
//  1. prefixes the configured API base URL,
//  2. sends/receives JSON,
//  3. normalises Django REST Framework's two error shapes into one ApiError.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

// Per-field validation messages, keyed by field name (e.g. { annual_rate: "..." }).
export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// DRF returns either { detail: "..." } (auth/permission) or
// { field: ["msg", ...] | "msg" } (validation). Flatten both into ApiError.
function normaliseError(status: number, body: unknown): ApiError {
  if (body && typeof body === 'object') {
    const data = body as Record<string, unknown>

    if (typeof data.detail === 'string') {
      return new ApiError(data.detail, status)
    }

    const fieldErrors: FieldErrors = {}
    for (const [key, value] of Object.entries(data)) {
      fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value)
    }
    // Prefer a non-field error as the headline message, else a generic one.
    const message =
      fieldErrors.non_field_errors ?? 'Please correct the highlighted fields.'
    return new ApiError(message, status, fieldErrors)
  }

  return new ApiError(`Request failed (${status})`, status)
}

/** POST a JSON body and return the parsed JSON response, or throw ApiError. */
export async function apiPost<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // Network failure (server down, CORS, offline) — fetch rejects with no status.
    throw new ApiError('Could not reach the server. Is the backend running?', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw normaliseError(response.status, data)
  }

  return data as TResponse
}
