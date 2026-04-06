export class ApiError extends Error {
  constructor({
    message = "API request failed.",
    statusCode = 500,
    errors = [],
    payload = null,
  } = {}) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.errors = errors
    this.payload = payload
  }
}

const normalizeErrorItem = (item) => ({
  field: item?.field || null,
  detail: item?.detail || "Unknown error",
  code: item?.code || "unknown_error",
})

export function normalizeApiErrorPayload(payload, fallbackStatusCode) {
  if (!payload || typeof payload !== "object") {
    return new ApiError({
      message: `API request failed with status ${fallbackStatusCode}.`,
      statusCode: fallbackStatusCode,
      payload,
    })
  }

  const errors = Array.isArray(payload.errors)
    ? payload.errors.map(normalizeErrorItem)
    : []

  const message =
    errors[0]?.detail ||
    payload.detail ||
    payload.message ||
    `API request failed with status ${fallbackStatusCode}.`

  return new ApiError({
    message,
    statusCode: payload.status_code || fallbackStatusCode,
    errors,
    payload,
  })
}
