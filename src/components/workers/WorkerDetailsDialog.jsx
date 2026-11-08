import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import SproutLoader from '@/components/common/SproutLoader'
import { listAttendance, listPayments } from '@/services/workersService'
import { ATTENDANCE_STATUSES, PAYMENT_TYPES } from '@/lib/workerOptions'

export default function WorkerDetailsDialog({ open, onOpenChange, worker }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState([])
  const [payments, setPayments] = useState([])
  const [tab, setTab] = useState('attendance')

  useEffect(() => {
    if (!open || !worker) return
    setLoading(true)
    Promise.all([
      listAttendance({ workerId: worker.id }),
      listPayments({ workerId: worker.id }),
    ]).then(([a, p]) => {
      setAttendance(a.data || [])
      setPayments(p.data || [])
      setLoading(false)
    })
  }, [open, worker])

  if (!worker) return null

  const bdt = (n) =>
    `৳${Number(n || 0).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US')}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{worker.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat label={t('workers.contact')} value={worker.contact} />
          <Stat label={t('workers.salary')} value={bdt(worker.salary)} />
          <Stat label={t('workers.joiningDate')} value={worker.joiningDate} />
          <Stat label={t('workers.status')} value={worker.status} />
        </div>

        <div className="flex rounded-xl border border-forest-100 bg-white p-1 mb-4">
          {[
            { id: 'attendance', label: t('workers.attendance') },
            { id: 'payments', label: t('workers.payments') },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                tab === tb.id ? 'bg-forest text-white' : 'text-forest-700'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : tab === 'attendance' ? (
          attendance.length === 0 ? (
            <p className="text-sm text-forest-700/60 text-center py-8">
              {t('workers.noAttendance')}
            </p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t('workers.date')}</th>
                    <th className="px-3 py-2 font-semibold">{t('workers.attendanceStatus')}</th>
                    <th className="px-3 py-2 font-semibold">{t('workers.notes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => {
                    const st = ATTENDANCE_STATUSES.find((s) => s.id === a.status)
                    return (
                      <tr key={a.id} className="border-t border-forest-50">
                        <td className="px-3 py-2 text-forest-700/80">{a.date}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ color: st?.color, background: `${st?.color}1A` }}
                          >
                            {st?.label || a.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-forest-700/60">
                          {a.notes || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          payments.length === 0 ? (
            <p className="text-sm text-forest-700/60 text-center py-8">
              {t('workers.noPayments')}
            </p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{t('workers.date')}</th>
                    <th className="px-3 py-2 font-semibold">{t('workers.paymentType')}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t('workers.amount')}</th>
                    <th className="px-3 py-2 font-semibold">{t('workers.month')}</th>
                    <th className="px-3 py-2 font-semibold">{t('workers.method')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const pt = PAYMENT_TYPES.find((tt) => tt.id === p.type)
                    return (
                      <tr key={p.id} className="border-t border-forest-50">
                        <td className="px-3 py-2 text-forest-700/80">{p.date}</td>
                        <td className="px-3 py-2 text-forest-900">{pt?.label || p.type}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">
                          {bdt(p.amount)}
                        </td>
                        <td className="px-3 py-2 text-xs text-forest-700/60">{p.month || '—'}</td>
                        <td className="px-3 py-2 text-xs uppercase text-forest-700/60">{p.method}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-forest-50 bg-sage/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-700/60">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-forest-900 truncate">{value || '—'}</p>
    </div>
  )
}