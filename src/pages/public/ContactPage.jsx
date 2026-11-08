import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10, 'Message is too short'),
})

export default function ContactPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
    reset()
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div>
      <section className="bg-gradient-to-b from-sage/70 to-cream">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-forest-900">{t('contact.title')}</h1>
          <p className="mt-4 text-lg text-forest-700/80 max-w-2xl">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 sm:p-8 shadow-card border border-forest-50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">{t('contact.name')}</Label>
                <Input id="name" {...register('name')} className="mt-1.5" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">{t('contact.email')}</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1.5" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="message">{t('contact.message')}</Label>
              <Textarea id="message" rows={5} {...register('message')} className="mt-1.5" />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                {isSubmitting ? t('common.loading') : t('common.sendMessage')}
              </Button>
              {sent && <span className="text-sm text-fresh-600 animate-fade-up">{t('contact.success')}</span>}
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <InfoCard icon={MapPin} title="Address" value={t('contact.address')} />
          <InfoCard icon={Phone} title="Phone" value={t('contact.phone')} />
          <InfoCard icon={Mail} title="Email" value="hello@khamar.app" />
        </aside>
      </section>
    </div>
  )
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card border border-forest-50">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-sage flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-forest-700" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-forest-700/60">{title}</p>
          <p className="text-sm text-forest-800 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}