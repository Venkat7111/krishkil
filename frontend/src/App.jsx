import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/components/common/Toast'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Loader from '@/components/common/Loader'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

const Splash = lazy(() => import('@/pages/Splash'))
const Welcome = lazy(() => import('@/pages/Welcome'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const AIChat = lazy(() => import('@/pages/app/AIChat'))
const DiseaseDetection = lazy(() => import('@/pages/app/DiseaseDetection'))
const CropRecommendation = lazy(() => import('@/pages/app/CropRecommendation'))
const Weather = lazy(() => import('@/pages/app/Weather'))
const Irrigation = lazy(() => import('@/pages/app/Irrigation'))
const Fertilizer = lazy(() => import('@/pages/app/Fertilizer'))
const Market = lazy(() => import('@/pages/app/Market'))
const News = lazy(() => import('@/pages/app/News'))
const GovernmentSchemes = lazy(() => import('@/pages/app/GovernmentSchemes'))
const Reports = lazy(() => import('@/pages/app/Reports'))
const Profile = lazy(() => import('@/pages/app/Profile'))
const Settings = lazy(() => import('@/pages/app/Settings'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const queryClient = new QueryClient()

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <BrowserRouter>
                  <Suspense fallback={<Loader label="Loading..." />}>
                    <Routes>
                      <Route path="/" element={<Splash />} />
                      <Route path="/welcome" element={<Welcome />} />

                      <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/otp-verification" element={<OTPVerification />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                      </Route>

                      <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                          <Route path="/app" element={<Dashboard />} />
                          <Route path="/app/dashboard" element={<Dashboard />} />
                          <Route path="/app/chat" element={<AIChat />} />
                          <Route path="/app/disease-detection" element={<DiseaseDetection />} />
                          <Route path="/app/crop-recommendation" element={<CropRecommendation />} />
                          <Route path="/app/weather" element={<Weather />} />
                          <Route path="/app/irrigation" element={<Irrigation />} />
                          <Route path="/app/fertilizer" element={<Fertilizer />} />
                          <Route path="/app/market" element={<Market />} />
                          <Route path="/app/news" element={<News />} />
                          <Route path="/app/schemes" element={<GovernmentSchemes />} />
                          <Route path="/app/reports" element={<Reports />} />
                          <Route path="/app/profile" element={<Profile />} />
                          <Route path="/app/settings" element={<Settings />} />
                        </Route>
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
