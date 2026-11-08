import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/app/AppLayout'
import HomePage from '@/pages/public/HomePage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/app/DashboardPage'
import AnimalsPage from '@/pages/app/AnimalsPage'
import ExpensesPage from '@/pages/app/ExpensesPage'
import SalesPage from '@/pages/app/SalesPage'
import ProductionPage from '@/pages/app/ProductionPage'
import InventoryPage from '@/pages/app/InventoryPage'
import UtilitiesPage from '@/pages/app/UtilitiesPage'
import WorkersPage from '@/pages/app/WorkersPage'
import ReportsPage from '@/pages/app/ReportsPage'
import BranchesPage from '@/pages/app/BranchesPage'
import SettingsPage from '@/pages/app/SettingsPage'
import ProfilePage from '@/pages/app/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { useAuthStore } from '@/store/authStore'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/signup', element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
  { path: '/forgot-password', element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'animals', element: <AnimalsPage /> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'production', element: <ProductionPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'utilities', element: <UtilitiesPage /> },
      { path: 'workers', element: <WorkersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
])

export default function AppRouter() {
  const hydrate = useAuthStore((s) => s.hydrate)
  useEffect(() => { hydrate() }, [hydrate])
  return <RouterProvider router={router} />
}