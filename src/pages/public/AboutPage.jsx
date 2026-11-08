import { useTranslation } from 'react-i18next'
import { Leaf, Users, ShieldCheck, Sprout } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutPage() {
  const { t } = useTranslation()

  const values = [
    { icon: Leaf, title: 'Clarity', desc: 'Numbers you can trust.' },
    { icon: Users, title: 'For people', desc: 'Built with farmers, not for them.' },
    { icon: ShieldCheck, title: 'Trust', desc: 'Your data stays yours.' },
    { icon: Sprout, title: 'Growth', desc: 'Tools that scale with your farm.' },
  ]

  return (
    <div>
      <section className="bg-gradient-to-b from-sage/70 to-cream">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl sm:text-5xl font-bold text-forest-900">{t('about.title')}</h1>
          <p className="mt-4 text-lg text-forest-700/80 max-w-2xl">{t('about.subtitle')}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <p className="max-w-3xl text-forest-800/90 text-lg leading-relaxed">{t('about.body')}</p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-5">
                <div className="h-10 w-10 rounded-xl bg-sage flex items-center justify-center">
                  <Icon className="h-5 w-5 text-forest-700" />
                </div>
                <h3 className="mt-3 font-semibold text-forest-900">{title}</h3>
                <p className="mt-1 text-sm text-forest-700/75">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}