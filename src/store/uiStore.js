import { create } from 'zustand'
import i18n from '@/i18n'

export const useUIStore = create((set) => ({
  lang: i18n.language || 'en',
  toggleLang: () => {
    const next = (i18n.language || 'en') === 'en' ? 'bn' : 'en'
    i18n.changeLanguage(next)
    set({ lang: next })
  },
  setLang: (lng) => {
    i18n.changeLanguage(lng)
    set({ lang: lng })
  },
}))