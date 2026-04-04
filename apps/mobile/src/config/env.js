const trimTrailingSlash = (value) => value.replace(/\/+$/, "")

export const mobileEnv = {
  apiBaseUrl: trimTrailingSlash(
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  ),
}
