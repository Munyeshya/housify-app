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

async function registerAndLogin(endpoint, payload) {
  await apiClient.post(endpoint, payload, {
    token: "",
  })

  return login({
    email: payload.email,
    password: payload.password,
  })
}

export async function registerTenant(payload) {
  return registerAndLogin(apiEndpoints.auth.registerTenant, payload)
}

export async function registerLandlord(payload) {
  return registerAndLogin(apiEndpoints.auth.registerLandlord, payload)
}

export async function registerAgent(payload) {
  return registerAndLogin(apiEndpoints.auth.registerAgent, payload)
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
