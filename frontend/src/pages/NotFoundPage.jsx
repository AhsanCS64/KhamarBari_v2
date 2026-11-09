import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cream text-center p-6">
      <img src="/sprout.svg" alt="" className="h-16 w-16" />
      <h1 className="mt-4 text-3xl font-bold text-forest-900">404 — Page not found</h1>
      <p className="mt-2 text-forest-700/80">The page you're looking for doesn't exist.</p>
      <Button className="mt-6" asChild><Link to="/">Back to Home</Link></Button>
    </div>
  )
}