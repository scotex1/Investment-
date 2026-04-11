import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'

import Layout from "./components/layout/Layout.js"
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import PortfolioPage from '@/pages/PortfolioPage'
import RiskProfilePage from '@/pages/RiskProfilePage'
import StockAnalysisPage from '@/pages/StockAnalysisPage'
import NewsPage from '@/pages/NewsPage'
import GeoEventsPage from '@/pages/GeoEventsPage'
import PlannerPage from '@/pages/PlannerPage'
import SubscriptionPage from '@/pages/SubscriptionPage'
import LoadingScreen from '@/components/ui/LoadingScreen'

// 🔐 Private Route
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore()

  if (loading) return <LoadingScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const init = useAuthStore(s => s.init)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => {
    init()
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="risk" element={<RiskProfilePage />} />
          <Route path="stocks" element={<StockAnalysisPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="geo-events" element={<GeoEventsPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
