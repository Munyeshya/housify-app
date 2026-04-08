import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../services/api/storage"

export function getToken() {
  return getStoredAuthToken()
}

export function setToken(token) {
  setStoredAuthToken(token)
}

export function clearAuth() {
  clearStoredAuthToken()
}
