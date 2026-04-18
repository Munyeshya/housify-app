const trimTrailingSlash = (value) => value.replace(/\/+$/, "")

export const webEnv = {
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  ),
  apiVersionPrefix: import.meta.env.VITE_API_VERSION_PREFIX || "/api/v1",
  geoJsonBaseUrl: import.meta.env.VITE_GEOJSON_BASE_URL
    ? trimTrailingSlash(import.meta.env.VITE_GEOJSON_BASE_URL)
    : "/geojson/rwanda",
  authStorageKey:
    import.meta.env.VITE_AUTH_STORAGE_KEY || "housify.web.auth-token",
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
}
