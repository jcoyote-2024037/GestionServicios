import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '../../shared/components/ui/Spinner'
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute'
import { MainLayout } from '../../shared/components/layout/MainLayout'
import { ROLES } from '../../shared/constants'

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage'))
const VerifyEmailPage = lazy(() => import('../../features/profile/pages/VerifyEmailPage'))
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'))
const ServicesPage = lazy(() => import('../../features/services/pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('../../features/services/pages/ServiceDetailPage'))
const ServiceFormPage = lazy(() => import('../../features/services/pages/ServiceFormPage'))
const SolicitudesPage = lazy(() => import('../../features/solicitudes/pages/SolicitudesPage'))
const SolicitudDetailPage = lazy(() => import('../../features/solicitudes/pages/SolicitudDetailPage'))
const FavoritesPage = lazy(() => import('../../features/favorites/pages/FavoritesPage'))
const NotificationsPage = lazy(() => import('../../features/notifications/pages/NotificationsPage'))
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'))
const AdminDashboard = lazy(() => import('../../features/admin/pages/AdminDashboard'))
const UsersPage = lazy(() => import('../../features/admin/pages/UsersPage'))
const CategoriesPage = lazy(() => import('../../features/admin/pages/CategoriesPage'))
const CategoryFormPage = lazy(() => import('../../features/admin/pages/CategoryFormPage'))
const LocationsPage = lazy(() => import('../../features/admin/pages/LocationsPage'))
const LocationFormPage = lazy(() => import('../../features/admin/pages/LocationFormPage'))
const TagsPage = lazy(() => import('../../features/admin/pages/TagsPage'))
const TagFormPage = lazy(() => import('../../features/admin/pages/TagFormPage'))
const BadgesPage = lazy(() => import('../../features/admin/pages/BadgesPage'))
const BadgeFormPage = lazy(() => import('../../features/admin/pages/BadgeFormPage'))
const ReportsPage = lazy(() => import('../../features/admin/pages/ReportsPage'))
const LogsPage = lazy(() => import('../../features/admin/pages/LogsPage'))
const MyServicesPage = lazy(() => import('../../features/services/pages/MyServicesPage'))

const LazyLoad = ({ children }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Spinner /></div>}>
    {children}
  </Suspense>
)

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LazyLoad><LoginPage /></LazyLoad>} />
    <Route path="/register" element={<LazyLoad><RegisterPage /></LazyLoad>} />
    <Route path="/forgot-password" element={<LazyLoad><ForgotPasswordPage /></LazyLoad>} />
    <Route path="/verify-email" element={<LazyLoad><VerifyEmailPage /></LazyLoad>} />

    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<LazyLoad><DashboardPage /></LazyLoad>} />
      <Route path="/services" element={<LazyLoad><ServicesPage /></LazyLoad>} />
      <Route path="/services/new" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><LazyLoad><ServiceFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/services/:id" element={<LazyLoad><ServiceDetailPage /></LazyLoad>} />
      <Route path="/services/:id/edit" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><LazyLoad><ServiceFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/solicitudes" element={<LazyLoad><SolicitudesPage /></LazyLoad>} />
      <Route path="/solicitudes/:id" element={<LazyLoad><SolicitudDetailPage /></LazyLoad>} />
      <Route path="/favorites" element={<LazyLoad><FavoritesPage /></LazyLoad>} />
      <Route path="/profile" element={<LazyLoad><ProfilePage /></LazyLoad>} />
      <Route path="/notifications" element={<LazyLoad><NotificationsPage /></LazyLoad>} />
      <Route path="/admin/services" element={<ProtectedRoute requiredRole={[ROLES.ADMIN, ROLES.DUENO]}><LazyLoad><MyServicesPage /></LazyLoad></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><AdminDashboard /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><UsersPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><CategoriesPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/categories/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><CategoryFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/categories/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><CategoryFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/locations" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><LocationsPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/locations/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><LocationFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/locations/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><LocationFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/tags" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><TagsPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/tags/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><TagFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/tags/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><TagFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/badges" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><BadgesPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/badges/new" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><BadgeFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/badges/:id/edit" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><BadgeFormPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><ReportsPage /></LazyLoad></ProtectedRoute>} />
      <Route path="/admin/logs" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><LazyLoad><LogsPage /></LazyLoad></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)
