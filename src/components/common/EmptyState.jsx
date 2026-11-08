import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-sage flex items-center justify-center">
        <Icon className="h-6 w-6 text-forest-700" />
      </div>
      <h3 className="mt-4 font-semibold text-forest-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-forest-700/70 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}