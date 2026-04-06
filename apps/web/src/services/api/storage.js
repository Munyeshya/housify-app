import { webEnv } from "../../config/env"

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage)

export function getStoredAuthToken() {
  if (!hasStorage()) {
    return ""
  }

  return window.localStorage.getItem(webEnv.authStorageKey) || ""
}

export function setStoredAuthToken(token) {
  if (!hasStorage()) {
    return
  }

  if (!token) {
    window.localStorage.removeItem(webEnv.authStorageKey)
    return
  }

  window.localStorage.setItem(webEnv.authStorageKey, token)
}

export function clearStoredAuthToken() {
  setStoredAuthToken("")
}
