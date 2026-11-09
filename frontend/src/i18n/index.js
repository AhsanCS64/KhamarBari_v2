import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import bn from './bn.json'

const saved = typeof window !== 'undefined' ? localStorage.getItem('khamar.lang') : null
const initial = saved || 'en'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, bn: { translation: bn } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('khamar.lang', lng)
    document.documentElement.lang = lng
  }
})

export default i18n