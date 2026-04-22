import { apiRequest } from "./client"
import { apiEndpoints } from "./endpoints"

export const authApi = {
  login(credentials) {
    return apiRequest(apiEndpoints.auth.login, {
      body: credentials,
      method: "POST",
    })
  },
  logout(token) {
    return apiRequest(apiEndpoints.auth.logout, {
      body: {},
      method: "POST",
      token,
    })
  },
  me(token) {
    return apiRequest(apiEndpoints.auth.me, {
      method: "GET",
      token,
    })
  },
}
