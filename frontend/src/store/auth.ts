import { create } from "zustand"
import { api } from "../services/api"

export interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,
  loading: true,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    const { token, user } = res.data
    localStorage.setItem("token", token)
    set({ token, user })
  },

  register: async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password })
    const { token, user } = res.data
    localStorage.setItem("token", token)
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem("token")
    set({ token: null, user: null })
  },

  loadUser: async () => {
    const token = get().token
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const res = await api.get("/auth/me")
      set({ user: res.data, loading: false })
    } catch {
      localStorage.removeItem("token")
      set({ token: null, user: null, loading: false })
    }
  },

  updateUser: (user: User) => {
    set({ user })
  },
}))
