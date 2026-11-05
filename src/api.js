// An empty base keeps requests same-origin; Vite proxies /api during development.
const configuredApiBase = import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

// Preserve structured API details so the form can show useful field-level errors.
export class EnquiryApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'EnquiryApiError'
    this.kind = options.kind || 'server'
    this.status = options.status
    this.fieldErrors = options.fieldErrors || {}
  }
}

export async function submitEnquiry(payload, options = {}) {
  const fetchImpl = options.fetchImpl || fetch
  const baseUrl = options.baseUrl ?? configuredApiBase

  let response
  try {
    // Send JSON to Express while the form manages loading and feedback states.
    response = await fetchImpl(`${baseUrl}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Network failures have no HTTP response, so convert them to a friendly error.
    throw new EnquiryApiError(
      'We could not reach the enquiry server. Your details are still here—please try again when the server is available.',
      { kind: 'network' },
    )
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Invalid JSON is handled as an unexpected response below.
  }

  if (!response.ok) {
    // Avoid exposing server details while still distinguishing retryable failures.
    const serverUnavailable = response.status >= 500
    const serverMessage = typeof data?.message === 'string' ? data.message : ''
    throw new EnquiryApiError(
      serverMessage || (serverUnavailable
        ? 'The enquiry server is unavailable right now. Your details are still here—please try again shortly.'
        : 'The enquiry could not be submitted. Please review your details and try again.'),
      { kind: serverUnavailable ? 'network' : 'server', status: response.status, fieldErrors: data?.errors },
    )
  }

  // Clear the form only when the API confirms that an enquiry was created.
  if (response.status !== 201
    || !Number.isSafeInteger(data?.id)
    || data.id < 1
    || typeof data.message !== 'string'
    || !data.message.trim()) {
    throw new EnquiryApiError(
      'The enquiry server returned an unexpected response. Your details are still here—please try again.',
      { status: response.status },
    )
  }

  return data
}
