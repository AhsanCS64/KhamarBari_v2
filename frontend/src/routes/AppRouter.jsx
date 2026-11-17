import { lazy, Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, useRouteError } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
const AppLayout = lazy(() => import('@/components/layout/app/AppLayout'))
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'))
const AnimalsPage = lazy(() => import('@/pages/app/AnimalsPage'))
const ExpensesPage = lazy(() => import('@/pages/app/ExpensesPage'))
const SalesPage = lazy(() => import('@/pages/app/SalesPage'))
const ProductionPage = lazy(() => import('@/pages/app/ProductionPage'))
const InventoryPage = lazy(() => import('@/pages/app/InventoryPage'))
const UtilitiesPage = lazy(() => import('@/pages/app/UtilitiesPage'))
const WorkersPage = lazy(() => import('@/pages/app/WorkersPage'))
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage'))
const BranchesPage = lazy(() => import('@/pages/app/BranchesPage'))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'))
const ProfilePage = lazy(() => import('@/pages/app/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
import ProtectedRoute from '@/routes/ProtectedRoute'
import PublicOnlyRoute from '@/routes/PublicOnlyRoute'
import { useAuthStore } from '@/store/authStore'

function RouteError() {
  const error = useRouteError()
  return <div className="route-loading"><div className="max-w-md rounded-2xl border border-forest-100 bg-white p-8 text-center shadow-soft"><h1 className="text-xl font-bold">This page could not load</h1><p className="mt-3 text-sm text-forest-700">Please reload to try again. Your saved farm records are unaffected.</p><button className="mt-5 rounded-xl bg-forest px-5 py-3 text-white" onClick={() => window.location.reload()}>Reload page</button><a className="ml-4 text-sm underline" href="/">Go home</a>{import.meta.env.DEV && <p className="mt-4 break-words text-xs">{error?.message}</p>}</div></div>
}

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  { path: '/login', errorElement: <RouteError />, element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/signup', errorElement: <RouteError />, element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
  { path: '/forgot-password', errorElement: <RouteError />, element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute> },
  {
    path: '/dashboard',
    errorElement: <RouteError />,
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
  return <Suspense fallback={<div className="route-loading" role="status"><img src="/sprout.svg" alt="" /><span>Loading KhamarBari...</span></div>}><RouterProvider router={router} /></Suspense>
}