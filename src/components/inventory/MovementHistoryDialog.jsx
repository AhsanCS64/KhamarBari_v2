import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import SproutLoader from '@/components/common/SproutLoader'
import { listMovements } from '@/services/inventoryService'
import { MOVEMENT_TYPES } from '@/lib/inventoryOptions'

export default function MovementHistoryDialog({ open, onOpenChange, item }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [moves, setMoves] = useState([])

  useEffect(() => {
    if (!open || !item) return
    setLoading(true)
    listMovements({ itemId: item.id }).then(({ data }) => {
      setMoves(data || [])
      setLoading(false)
    })
  }, [open, item])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('inventory.movementHistory')} — {item.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <SproutLoader label={t('common.loading')} />
        ) : moves.length === 0 ? (
          <p className="text-sm text-forest-700/70 text-center py-8">{t('inventory.noMovements')}</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sage/40 text-[11px] uppercase tracking-wider text-forest-700/70">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('inventory.date')}</th>
                  <th className="px-3 py-2 font-semibold">{t('inventory.movementType')}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t('inventory.quantity')}</th>
                  <th className="px-3 py-2 font-semibold">{t('inventory.reference')}</th>
                  <th className="px-3 py-2 font-semibold">{t('inventory.recordedBy')}</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m) => {
                  const type = MOVEMENT_TYPES.find((tt) => tt.id === m.type)
                  const sign = m.type === 'purchase' ? '+' : m.type === 'usage' ? '−' : m.type === 'adjustment' ? '=' : '−'
                  return (
                    <tr key={m.id} className="border-t border-forest-50">
                      <td className="px-3 py-2 text-forest-700/80 whitespace-nowrap">{m.date}</td>
                      <td className="px-3 py-2 text-forest-900">{type?.label || m.type}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{sign}{m.quantity} {m.unit}</td>
                      <td className="px-3 py-2 text-xs text-forest-700/70">{m.reference || '—'}</td>
                      <td className="px-3 py-2 text-xs text-forest-700/70">{m.recordedBy || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}