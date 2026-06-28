import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '../../shared/components/layout/Navbar'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { ServicesPage } from '../../features/services/pages/ServicesPage'
import { ServiceDetailPage } from '../../features/services/pages/ServiceDetailPage'
import { ServiceFormPage } from '../../features/services/pages/ServiceFormPage'
import { RequestsPage } from '../../features/requests/pages/RequestsPage'
import { FavoritesPage } from '../../features/favorites/pages/FavoritesPage'
import { ProfilePage } from '../../features/profile/pages/ProfilePage'
import { AdminPage } from '../../features/admin/pages/AdminPage'

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
)

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
    <Route path="/services/:id" element={<Layout><ServiceDetailPage /></Layout>} />

    {/* Protected */}
    <Route path="/services/new" element={
      <ProtectedRoute><Layout><ServiceFormPage /></Layout></ProtectedRoute>
    } />
    <Route path="/requests" element={
      <ProtectedRoute><Layout><RequestsPage /></Layout></ProtectedRoute>
    } />
    <Route path="/favorites" element={
      <ProtectedRoute><Layout><FavoritesPage /></Layout></ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute adminOnly><Layout><AdminPage /></Layout></ProtectedRoute>
    } />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
