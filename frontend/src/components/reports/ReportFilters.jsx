import { useTranslation } from 'react-i18next'
import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ReportFilters({ dateFrom, dateTo, onDateFromChange, onDateToChange, onExport, canExport }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-forest-50 bg-white p-3 shadow-card">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-forest-700/60" />
        <span className="text-xs font-semibold text-forest-700/70">{t('reports.from')}</span>
        <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} className="h-9 w-auto" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-forest-700/70">{t('reports.to')}</span>
        <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} className="h-9 w-auto" />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const today = new Date()
          const first = new Date(today.getFullYear(), today.getMonth(), 1)
          onDateFromChange(first.toISOString().slice(0, 10))
          onDateToChange(today.toISOString().slice(0, 10))
        }}
      >
        {t('reports.thisMonth')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const today = new Date()
          const start = new Date(today); start.setDate(today.getDate() - 30)
          onDateFromChange(start.toISOString().slice(0, 10))
          onDateToChange(today.toISOString().slice(0, 10))
        }}
      >
        {t('reports.last30')}
      </Button>
      <div className="ml-auto">
        <Button variant="outline" size="sm" onClick={onExport} disabled={!canExport}>
          <Download className="h-4 w-4" /> {t('common.export')}
        </Button>
      </div>
    </div>
  )
}