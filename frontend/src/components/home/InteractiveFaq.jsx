import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ_ITEMS = [0, 1, 2, 3, 4]

export default function InteractiveFaq() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
            {t('home.faq.kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-forest-950">
            {t('home.faq.title')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-forest-600">
            {t('home.faq.description')}
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((index) => {
            const isOpen = openIndex === index
            const questionKey = `home.faq.items.${index}.question`
            const answerKey = `home.faq.items.${index}.answer`
            return (
              <div
                key={questionKey}
                className="overflow-hidden rounded-2xl border border-forest-100 bg-white transition-all shadow-2xs hover:border-emerald-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-forest-950 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{t(questionKey)}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-forest-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-forest-700/85 leading-relaxed border-t border-forest-50 pt-3">
                        {t(answerKey)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
