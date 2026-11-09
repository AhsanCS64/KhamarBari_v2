import { motion } from 'framer-motion'
import { Star, ShieldCheck, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Haji Selim Reza',
    role: 'Owner, Reza Dairy & Cattle Farm',
    location: 'Sirajganj',
    scale: '180 Holstein Cows · 3 Branches',
    quote: 'Before KhamarBari, tracking feed wastage and milking logs across our Sirajganj and Pabna sheds gave me sleepless nights. Now, I see our exact morning milk and milk chilling sales on my smartphone before breakfast.',
    metric: 'Saved ৳74,000/mo on feed theft & wastage',
    avatarBg: 'bg-emerald-600',
    initials: 'SR',
  },
  {
    name: 'Shamima Nasrin',
    role: 'Managing Director, Green Hatchery & Poultry',
    location: 'Gazipur',
    scale: '24,000 Sonali & Broilers',
    quote: 'Vaccination schedules and egg mortality used to be kept in water-damaged paper notebooks. KhamarBari automated our vaccine alerts and batch profit calculations. Our bank approved our expansion loan in 3 days using the audited reports.',
    metric: 'Zero missed vaccination alerts in 14 months',
    avatarBg: 'bg-amber-600',
    initials: 'SN',
  },
  {
    name: 'Kabir Hossain',
    role: 'Lead Operator, Meghna Biofloc Fisheries',
    location: 'Chandpur',
    scale: '12 Earthen & Biofloc Ponds',
    quote: 'Water dissolved oxygen and feed conversion calculations used to be guesswork. With KhamarBari, my pond operators log water metrics right from the pond banks. We increased our harvest yield by 22% in our first season.',
    metric: '+22% Harvest Yield in First Season',
    avatarBg: 'bg-blue-600',
    initials: 'KH',
  },
]

export default function FarmerTestimonials() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#f9faf6] to-cream overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-3">
            TRUSTED IN 64 DISTRICTS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-forest-950">
            Loved by farmers, trusted by lenders
          </h2>
          <p className="mt-3 text-base sm:text-lg text-forest-600">
            Real farm owners across Bangladesh sharing how KhamarBari transformed their operations from guesswork into profitable clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative rounded-2xl border border-forest-100 bg-white p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-forest-800 ml-1.5">5.0</span>
                </div>

                <p className="text-sm text-forest-800 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-forest-100">
                {/* Highlight Metric Pill */}
                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t.metric}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.avatarBg} text-white font-bold text-sm shadow-xs`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-forest-950">{t.name}</h4>
                    <p className="text-xs text-forest-600">{t.role}</p>
                    <p className="text-[11px] text-forest-400">{t.location} · {t.scale}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
