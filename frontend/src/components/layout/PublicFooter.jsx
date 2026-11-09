import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function PublicFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 bg-forest-900 text-cream">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/sprout.svg" alt="" className="h-8 w-8 brightness-0 invert" />
            <span className="text-lg font-bold">{t('brand.name')}</span>
          </div>
          <p className="mt-3 text-sm text-cream/70 max-w-xs">{t('brand.tagline')}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">{t('footer.product')}</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-white">{t('nav.home')}</Link></li>
            <li><Link to="/about" className="hover:text-white">{t('nav.about')}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">{t('footer.company')}</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/signup" className="hover:text-white">{t('nav.signup')}</Link></li>
            <li><Link to="/login" className="hover:text-white">{t('nav.login')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">{t('contact.title')}</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              {t('contact.address')}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t('contact.phone')}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              hello@khamar.app
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
          <span>© {year} {t('brand.name')}. {t('footer.rights')}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}