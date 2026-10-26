import { createContext, useCallback, useContext, useEffect, useState } from "react"
import api from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("fitpay_user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem("fitpay_token"))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const t = localStorage.getItem("fitpay_token")
    if (!t) {
      setLoading(false)
      return null
    }
    try {
      const { data } = await api.get("/me")
      const u = data.data || data.user || data
      setUser(u)
      localStorage.setItem("fitpay_user", JSON.stringify(u))
      return u
    } catch {
      localStorage.removeItem("fitpay_token")
      localStorage.removeItem("fitpay_user")
      setUser(null)
      setToken(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password })
    const access = data.access_token || data.token
    const u = data.user
    localStorage.setItem("fitpay_token", access)
    localStorage.setItem("fitpay_user", JSON.stringify(u))
    setToken(access)
    setUser(u)
    return u
  }

  const register = async ({ name, email, password, password_confirmation, role = "member", phone, address, birthdate, gender }) => {
    const { data } = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
      role,
      phone,
      address,
      birthdate,
      gender,
    })
    const access = data.access_token || data.token
    const u = data.user
    localStorage.setItem("fitpay_token", access)
    localStorage.setItem("fitpay_user", JSON.stringify(u))
    setToken(access)
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await api.post("/logout")
    } catch {
      //
    } finally {
      localStorage.removeItem("fitpay_token")
      localStorage.removeItem("fitpay_user")
      setUser(null)
      setToken(null)
    }
  }

  const updateUser = useCallback((next) => {
    setUser(next)
    try {
      localStorage.setItem("fitpay_user", JSON.stringify(next))
    } catch {
      //
    }
  }, [])

  const value = { user, setUser: updateUser, token, loading, login, register, logout, fetchUser, isAuthenticated: !!token && !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
