/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { clearAuthToken, getAuthToken, getCurrentUser, logout } from "../services/api/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      if (!getAuthToken()) {
        if (isMounted) {
          setIsBootstrapping(false)
        }
        return
      }

      try {
        const nextUser = await getCurrentUser()
        if (isMounted) {
          setUser(nextUser)
        }
      } catch {
        clearAuthToken()
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user && getAuthToken()),
      isBootstrapping,
      setUser,
      user,
      async signOut() {
        await logout()
        setUser(null)
      },
    }),
    [isBootstrapping, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
