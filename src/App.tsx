import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GaragePage } from './pages/GaragePage'
import { VehiclePage } from './pages/VehiclePage'
import { StatisticsPage } from './pages/StatisticsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { PublicVehiclePage } from './pages/PublicVehiclePage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TrackingOverlay } from './components/TrackingOverlay'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/share/:token" element={<PublicVehiclePage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <GaragePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/vehicle/:id/:section?"
                    element={
                        <ProtectedRoute>
                            <VehiclePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/stats"
                    element={
                        <ProtectedRoute>
                            <StatisticsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <TrackingOverlay />
        </BrowserRouter>
    )
}

export default App
