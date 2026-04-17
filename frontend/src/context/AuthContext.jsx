import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'fixitcar_auth_v1'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    const p = JSON.parse(raw)
    return { token: p.token || null, user: p.user || null }
  } catch {
    return { token: null, user: null }
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const initial = loadStored()
  const [token, setToken] = useState(initial.token)
  const [user, setUser] = useState(initial.user)

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = useCallback(
    (newToken, newUser) => {
      setToken(newToken)
      setUser(newUser)
      persist(newToken, newUser)
    },
    [persist]
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    persist(null, null)
  }, [persist])

  const updateUser = useCallback(
    (patch) => {
      setUser((u) => {
        if (!u) return u
        const merged = { ...u, ...patch }
        persist(token, merged)
        return merged
      })
    },
    [persist, token]
  )

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUser,
    }),
    [token, user, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext precisa de AuthProvider')
  return ctx
}
