import { create } from 'zustand'
import { authAPI } from '@/services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  plan: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ loading: false }); return }
    try {
      const [meRes, planRes] = await Promise.all([authAPI.me(), authAPI.myPlan()])
      set({ user: meRes.data, plan: planRes.data, isAuthenticated: true, loading: false })
    } catch {
      localStorage.removeItem('access_token')
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    const res = await authAPI.login(email, password)
    localStorage.setItem('access_token', res.data.access_token)
    localStorage.setItem('refresh_token', res.data.refresh_token)
    const [meRes, planRes] = await Promise.all([authAPI.me(), authAPI.myPlan()])
    set({ user: meRes.data, plan: planRes.data, isAuthenticated: true })
    return res.data
  },

  register: async (data) => {
    const res = await authAPI.register(data)
    return res.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, plan: null, isAuthenticated: false })
  },

  refreshPlan: async () => {
    const planRes = await authAPI.myPlan()
    set({ plan: planRes.data })
  },
}))

export default useAuthStore
