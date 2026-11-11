
import { Sparkles, Code2, Award, Terminal, Cpu, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import kushalImg from '@/Photos/kushal.jpg'
import hemeImg from '@/Photos/heme.jpg'
import adnanImg from '@/Photos/adnan.jpg'

const FOUNDERS = [
  {
    name: 'Adnan Hassan',
    copyKey: 'adnan',
    image: adnanImg || '/photos/adnan.jpg',
    fallback: '/photos/adnan.jpg',
    icon: Terminal,
    color: 'from-[#fde047] to-[#a3e635]',
  },
  {
    name: 'Homayra Binte Harun Heme',
    copyKey: 'heme',
    image: hemeImg || '/photos/heme.jpg',
    fallback: '/photos/heme.jpg',
    icon: Cpu,
    color: 'from-[#6ee7b7] to-[#34d399]',
  },
  {
    name: 'H. M. Ahsan Habib Kushal',
    copyKey: 'kushal',
    image: kushalImg || '/photos/kushal.jpg',
    fallback: '/photos/kushal.jpg',
    icon: Compass,
    color: 'from-[#dcf88f] to-[#bce86f]',
  },
]

export default function FoundersSection() {
  const { t, i18n } = useTranslation()

  return (
    <section
      id="about-us"
      className="relative isolate overflow-hidden border-y border-white/[0.08] bg-[#061910] py-20 text-white sm:py-28"
    >
      {/* Ambient Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-60 left-1/2 h-[42rem] w-[65rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.10] blur-[140px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-lime-400/[0.07] blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/[0.08] px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-[#dcf88f]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#dcf88f]">
              {t('home.founders.eyebrow')}
            </span>
          </div>

          <h2 className="mt-6 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t('home.founders.title')}
            <br />
            <span className="bg-gradient-to-r from-[#dcf88f] via-[#b5ed78] to-[#4ade80] bg-clip-text text-transparent">
              {t('home.founders.titleHighlight')}
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-100/65 sm:text-base">
            {t('home.founders.description')}
          </p>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-lime-300/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#dcf88f]" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-lime-300/60" />
          </div>
        </motion.div>

        {/* Founder Cards */}
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16 lg:gap-7">
          {FOUNDERS.map((founder, index) => {
            const Icon = founder.icon

            return (
              <motion.article
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.12,
                  ease: 'easeOut',
                }}
                whileHover={{ y: -7 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.10] bg-gradient-to-b from-[#102d20]/95 to-[#091e15]/95 p-2.5 shadow-[0_15px_50px_rgba(0,0,0,0.2)] transition-colors duration-500 hover:border-lime-300/35 hover:shadow-[0_25px_65px_rgba(0,0,0,0.35)]"
              >
                {/* Card Accent */}
                <div
                  className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${founder.color} opacity-50 transition-opacity duration-300 group-hover:opacity-100`}
                />

                {/* Portrait */}
                <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-[1.3rem] bg-[#102d20]">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.currentTarget.src !== founder.fallback) {
                        e.currentTarget.src = founder.fallback
                      }
                    }}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                  />

                  {/* Image Treatment */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061910] via-[#061910]/15 to-transparent opacity-90" />

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#061910]/70 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute left-3 top-3 flex max-w-[90%] items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#dcf88f] shadow-[0_0_8px_rgba(220,248,143,0.8)]" />
                    <span className="truncate text-[10px] font-semibold tracking-wide text-white">
                      {t(`home.founders.${founder.copyKey}.badge`)}
                    </span>
                  </div>

                  {/* Bottom Identity */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#dcf88f]">
                        {t('home.founders.founder', {
                          number: new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 }).format(index + 1),
                        })}
                      </span>
                      <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                        {founder.name}
                      </h3>
                    </div>

                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-xl transition-all duration-300 group-hover:border-lime-200/50 group-hover:bg-[#dcf88f] group-hover:text-[#102819]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                      {t(`home.founders.${founder.copyKey}.role`)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                      {t('home.founders.expertise')}
                    </p>

                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#dcf88f]">
                      {t(`home.founders.${founder.copyKey}.focus`)}
                    </p>
                  </div>

                  <div className="my-4 h-px bg-gradient-to-r from-white/10 via-white/[0.07] to-transparent" />

                  {/* Quote */}
                  <div className="flex flex-1 gap-2.5">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/60" />
                    <p className="text-xs italic leading-[1.8] text-emerald-50/65">
                      &ldquo;{t(`home.founders.${founder.copyKey}.quote`)}&rdquo;
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <span className="text-[10px] font-semibold text-white/55">
                      {t('home.founders.team')}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-[#dcf88f]/80">
                      <Award className="h-3.5 w-3.5" />
                      {t('home.founders.cofounder')}
                    </span>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* Closing Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-lime-200/15 bg-gradient-to-r from-[#173d27]/80 via-[#102d20]/80 to-[#173d27]/80 px-5 py-6 text-center shadow-xl shadow-black/10 backdrop-blur-xl sm:px-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-lime-300/[0.08] blur-3xl"
          />

          <p className="relative text-xs leading-7 text-emerald-50/75 sm:text-sm">
            <strong className="font-bold text-[#dcf88f]">
              {t('home.founders.closing')}
            </strong>
            <span className="mx-2 text-white/25">·</span>
            {t('home.founders.closingDescription')}
          </p>
        </motion.div>

      </div>
    </section>
  )
}
