import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage'
import { VerifyEmailPage } from '../../features/profile/pages/VerifyEmailPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { ServicesPage } from '../../features/services/pages/ServicesPage'
import { ServiceDetailPage } from '../../features/services/pages/ServiceDetailPage'
import { ServiceFormPage } from '../../features/services/pages/ServiceFormPage'
import { SolicitudesPage } from '../../features/solicitudes/pages/SolicitudesPage'
import { SolicitudDetailPage } from '../../features/solicitudes/pages/SolicitudDetailPage'
import { FavoritesPage } from '../../features/favorites/pages/FavoritesPage'
import { ProfilePage } from '../../features/profile/pages/ProfilePage'
import { AdminDashboard } from '../../features/admin/pages/AdminDashboard'
import { UsersPage } from '../../features/admin/pages/UsersPage'
import { CategoriesPage } from '../../features/admin/pages/CategoriesPage'
import { CategoryFormPage } from '../../features/admin/pages/CategoryFormPage'
import { LocationsPage } from '../../features/admin/pages/LocationsPage'
import { LocationFormPage } from '../../features/admin/pages/LocationFormPage'
import { TagsPage } from '../../features/admin/pages/TagsPage'
import { TagFormPage } from '../../features/admin/pages/TagFormPage'
import { BadgesPage } from '../../features/admin/pages/BadgesPage'
import { BadgeFormPage } from '../../features/admin/pages/BadgeFormPage'
import { ReportsPage } from '../../features/admin/pages/ReportsPage'
import { LogsPage } from '../../features/admin/pages/LogsPage'
import { MyServicesPage } from '../../features/services/pages/MyServicesPage'
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute'
import { MainLayout } from '../../shared/components/layout/MainLayout'
import { ROLES } from '../../shared/constants'

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />

    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/new" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><ServiceFormPage /></ProtectedRoute>} />
      <Route path="/services/:id" element={<ServiceDetailPage />} />
      <Route path="/services/:id/edit" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><ServiceFormPage /></ProtectedRoute>} />
      <Route path="/solicitudes" element={<SolicitudesPage />} />
      <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/services" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><MyServicesPage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><CategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/categories/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><CategoryFormPage /></ProtectedRoute>} />
      <Route path="/admin/categories/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><CategoryFormPage /></ProtectedRoute>} />
      <Route path="/admin/locations" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LocationsPage /></ProtectedRoute>} />
      <Route path="/admin/locations/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LocationFormPage /></ProtectedRoute>} />
      <Route path="/admin/locations/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LocationFormPage /></ProtectedRoute>} />
      <Route path="/admin/tags" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><TagsPage /></ProtectedRoute>} />
      <Route path="/admin/tags/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><TagFormPage /></ProtectedRoute>} />
      <Route path="/admin/tags/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><TagFormPage /></ProtectedRoute>} />
      <Route path="/admin/badges" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><BadgesPage /></ProtectedRoute>} />
      <Route path="/admin/badges/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><BadgeFormPage /></ProtectedRoute>} />
      <Route path="/admin/badges/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><BadgeFormPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><ReportsPage /></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LogsPage /></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)
