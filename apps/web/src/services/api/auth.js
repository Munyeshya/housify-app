import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "./storage"

export async function login(credentials) {
  const response = await apiClient.post(apiEndpoints.auth.login, credentials, {
    token: "",
  })

  if (response?.token) {
    setStoredAuthToken(response.token)
  }

  return response
}

export async function logout() {
  try {
    await apiClient.post(apiEndpoints.auth.logout, {})
  } finally {
    clearStoredAuthToken()
  }
}

export function getAuthToken() {
  return getStoredAuthToken()
}

export function clearAuthToken() {
  clearStoredAuthToken()
}

export async function getCurrentUser() {
  return apiClient.get(apiEndpoints.auth.me)
}
