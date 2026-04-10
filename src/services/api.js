import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Har request mein token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || 'Something went wrong'
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    } else if (err.response?.status === 403) {
      toast.error(`🔒 ${msg}`)
    } else if (err.response?.status !== 422) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data)         => api.post('/users/register', data),
  login: (email, password) => api.post('/users/login', { email, password }),
  me: ()                   => api.get('/users/me'),
  myPlan: ()               => api.get('/users/me/plan'),
}

// ── Subscriptions ─────────────────────────────────────────────
export const subAPI = {
  plans:   ()                   => api.get('/subscriptions/plans'),
  current: ()                   => api.get('/subscriptions/me'),
  cancel:  ()                   => api.post('/subscriptions/cancel'),
}

// ── Portfolio ─────────────────────────────────────────────────
export const portfolioAPI = {
  get:           ()        => api.get('/investments/portfolio'),
  addHolding:    (holding) => api.post('/investments/portfolio/holdings', holding),
  removeHolding: (ticker)  => api.delete(`/investments/portfolio/holdings/${ticker}`),
}

// ── Investment Engines ────────────────────────────────────────
export const investAPI = {
  report:      (risk_input)     => api.post('/investments/report', risk_input || {}),
  riskProfile: (data)           => api.post('/investments/risk-profile', data),
  stock:       (ticker, period) => api.post('/investments/stock', { ticker, period }),
  realEstate:  (data)           => api.post('/investments/real-estate', data),
  optimize:    (data)           => api.post('/investments/optimize', data),
  goalPlanner: (data)           => api.post('/investments/goal-planner', data),
  retirement:  (data)           => api.post('/investments/retirement', data),
  news:        (tickers)        => api.get('/investments/news', { params: { tickers: tickers?.join(',') || '' } }),
  geoEvents:   (tickers)        => api.get('/investments/geo-events', { params: { tickers: tickers?.join(',') || '' } }),
}

export default api
