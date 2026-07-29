import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '../../shared/components/ui/Spinner'
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute'
import { MainLayout } from '../../shared/components/layout/MainLayout'
import { ROLES } from '../../shared/constants'

const lazyDefault = (importFn) => lazy(() => importFn().then((m) => ({ default: m[Object.keys(m)[0]] })))

const LoginPage = lazyDefault(() => import('../../features/auth/pages/LoginPage'))
const RegisterPage = lazyDefault(() => import('../../features/auth/pages/RegisterPage'))
const ForgotPasswordPage = lazyDefault(() => import('../../features/auth/pages/ForgotPasswordPage'))
const VerifyEmailPage = lazyDefault(() => import('../../features/profile/pages/VerifyEmailPage'))
const DashboardPage = lazyDefault(() => import('../../features/dashboard/pages/DashboardPage'))
const ServicesPage = lazyDefault(() => import('../../features/services/pages/ServicesPage'))
const ServiceDetailPage = lazyDefault(() => import('../../features/services/pages/ServiceDetailPage'))
const ServiceFormPage = lazyDefault(() => import('../../features/services/pages/ServiceFormPage'))
const SolicitudesPage = lazyDefault(() => import('../../features/solicitudes/pages/SolicitudesPage'))
const SolicitudDetailPage = lazyDefault(() => import('../../features/solicitudes/pages/SolicitudDetailPage'))
const FavoritesPage = lazyDefault(() => import('../../features/favorites/pages/FavoritesPage'))
const NotificationsPage = lazyDefault(() => import('../../features/notifications/pages/NotificationsPage'))
const ProfilePage = lazyDefault(() => import('../../features/profile/pages/ProfilePage'))
const AdminDashboard = lazyDefault(() => import('../../features/admin/pages/AdminDashboard'))
const UsersPage = lazyDefault(() => import('../../features/admin/pages/UsersPage'))
const CategoriesPage = lazyDefault(() => import('../../features/admin/pages/CategoriesPage'))
const CategoryFormPage = lazyDefault(() => import('../../features/admin/pages/CategoryFormPage'))
const LocationsPage = lazyDefault(() => import('../../features/admin/pages/LocationsPage'))
const LocationFormPage = lazyDefault(() => import('../../features/admin/pages/LocationFormPage'))
const TagsPage = lazyDefault(() => import('../../features/admin/pages/TagsPage'))
const TagFormPage = lazyDefault(() => import('../../features/admin/pages/TagFormPage'))
const BadgesPage = lazyDefault(() => import('../../features/admin/pages/BadgesPage'))
const BadgeFormPage = lazyDefault(() => import('../../features/admin/pages/BadgeFormPage'))
const ReportsPage = lazyDefault(() => import('../../features/admin/pages/ReportsPage'))
const LogsPage = lazyDefault(() => import('../../features/admin/pages/LogsPage'))
const MyServicesPage = lazyDefault(() => import('../../features/services/pages/MyServicesPage'))

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
