import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export default function LanguageToggle({ className }) {
  const { i18n } = useTranslation()
  const toggleLang = useUIStore((s) => s.toggleLang)
  const isBn = i18n.language === 'bn'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLang}
      className={cn('gap-2 text-forest-700 hover:bg-sage', className)}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{isBn ? 'EN' : 'বাং'}</span>
    </Button>
  )
}