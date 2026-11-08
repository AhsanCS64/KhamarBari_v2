import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'Does KhamarBari work in rural areas with slow or intermittent internet?',
    a: 'Yes, absolutely. KhamarBari is built with an offline-resilient architecture. Your managers and farmhands can log milk yields, feed distribution, and sales even when mobile data drops. Everything automatically syncs to the central cloud the moment connectivity returns.',
  },
  {
    q: 'Can farm workers with limited tech literacy use the app easily?',
    a: 'Yes. We designed the interface in clear, authentic Bangla alongside English. Daily routine inputs like logging 20 liters of milk or marking a worker present take just two taps with big, self-explanatory icons.',
  },
  {
    q: 'Can I export reports for bank loans and government livestock subsidies?',
    a: 'Yes! KhamarBari generates one-click audited P&L statements, livestock valuation certificates, and inventory summaries in PDF and Excel (CSV) formatted specifically to meet Bangladesh commercial bank and DLS standards.',
  },
  {
    q: 'How many branches or farm locations can I connect?',
    a: 'You can manage from 1 family farm shed up to dozens of branch locations across different districts. Each branch can have its own local supervisor while the owner monitors consolidated revenue from one central screen.',
  },
  {
    q: 'How does the 14-day free trial work?',
    a: 'You get unrestricted access to every single feature, including multi-branch support, animal records, and automated exports. No credit card or prepayment is required. You can start in less than 2 minutes.',
  },
]

export default function InteractiveFaq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
            CLEAR ANSWERS FOR FARMERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-forest-950">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-forest-600">
            Have questions before bringing KhamarBari to your sheds and ponds? We have you covered.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-forest-100 bg-white transition-all shadow-2xs hover:border-emerald-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-forest-950 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
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
                        {faq.a}
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
