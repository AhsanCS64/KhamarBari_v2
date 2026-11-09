import { Sparkles, Code2, Award, Terminal, Cpu, Compass } from 'lucide-react'
import kushalImg from '@/Photos/kushal.jpg'
import hemeImg from '@/Photos/heme.jpg'
import adnanImg from '@/Photos/adnan.jpg'

const FOUNDERS = [
  {
    name: 'H. M. Ahsan Habib Kushal',
    role: 'Co-Founder & Lead Architect',
    focus: 'AI/ML Engineering and System Architect',
    image: kushalImg || '/photos/kushal.jpg',
    fallback: '/photos/kushal.jpg',
    icon: Compass,
    quote:
      'Empowering grassroots farms with modern technology, precision analytics, and effortless clarity.',
    badge: 'Lead Developer & Co-Founder',
    color: 'from-[#dcf88f] to-[#bce86f]',
  },
  {
    name: 'Homayra Binte Harun Heme',
    role: 'Co-Founder & Full-Stack Developer',
    focus: 'Product Innovation & UX Engineering',
    image: hemeImg || '/photos/heme.jpg',
    fallback: '/photos/heme.jpg',
    icon: Cpu,
    quote:
      'Designing intuitive, resilient tools that turn complex agricultural operations into calm daily joy.',
    badge: 'Co-Founder & Developer',
    color: 'from-[#6ee7b7] to-[#34d399]',
  },
  {
    name: 'Adnan Hassan',
    role: 'Co-Founder & Software Engineer',
    focus: 'Database Architecture & Core Engineering',
    image: adnanImg || '/photos/adnan.jpg',
    fallback: '/photos/adnan.jpg',
    icon: Terminal,
    quote:
      'Bridging modern web engineering with traditional agro practices to build a sustainable farming future.',
    badge: 'Co-Founder & Developer',
    color: 'from-[#fde047] to-[#a3e635]',
  },
]

export default function FoundersSection() {
  return (
    <section
      id="about-us"
      className="relative overflow-hidden bg-gradient-to-b from-[#061910] via-[#0b2b1d] to-[#071911] py-20 sm:py-28 text-white border-y border-white/[0.08]"
    >
      {/* Ambient Lighting & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[32rem] w-[54rem] rounded-full bg-gradient-to-b from-[#4ade80]/15 via-[#22c55e]/8 to-transparent blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-[#dcf88f]/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(228,245,219,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(228,245,219,0.3)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 backdrop-blur-md shadow-xs">
            <Sparkles className="h-4 w-4 text-[#dcf88f]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#dcf88f]">
              About Us · Meet The Founders
            </span>
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            The Developers &amp; Co-Founders of{' '}
            <span className="bg-gradient-to-r from-[#dcf88f] via-[#a3e635] to-[#4ade80] bg-clip-text text-transparent">
              KhamarBari
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 leading-relaxed max-w-2xl mx-auto">
            We are the creators and engineers behind KhamarBari. United by a vision to modernize agriculture in Bangladesh, we architect and develop intelligent tools to empower everyday farmers.
          </p>
        </div>

        {/* 3 Founders Grid */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {FOUNDERS.map((founder) => {
            const Icon = founder.icon
            return (
              <div
                key={founder.name}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0b2418]/80 p-3 backdrop-blur-xl transition-all duration-300 hover:border-[#dcf88f]/50 hover:bg-[#0f3020] hover:shadow-[0_20px_50px_rgba(15,60,35,0.5)]"
              >
                {/* Photo Frame */}
                <div className="relative aspect-[4/4.5] w-full overflow-hidden rounded-2xl bg-forest-950 shadow-inner">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    onError={(e) => {
                      if (e.currentTarget.src !== founder.fallback) {
                        e.currentTarget.src = founder.fallback
                      }
                    }}
                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Light Falloff */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071a11] via-[#071a11]/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-60" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-forest-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#dcf88f] animate-pulse" />
                    <span>{founder.badge}</span>
                  </div>

                  {/* Bottom Icon Overlay */}
                  <div className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-[#dcf88f] group-hover:text-forest-950">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#dcf88f]">
                      {founder.focus}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/80 font-mono">
                      <Code2 className="h-3 w-3" /> Developer
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-xl font-bold tracking-tight text-white group-hover:text-[#dcf88f] transition-colors">
                    {founder.name}
                  </h3>

                  <p className="text-xs font-semibold text-emerald-200/70 mt-0.5">
                    {founder.role}
                  </p>

                  <div className="my-3.5 border-t border-white/[0.08]" />

                  {/* Enigmatic quote */}
                  <p className="text-xs text-emerald-100/85 leading-relaxed italic flex-1">
                    &ldquo;{founder.quote}&rdquo;
                  </p>

                  {/* Bottom Highlight */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] text-emerald-300/70">
                    <span className="font-semibold text-[#f8faf6]">KhamarBari Co-Founder</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#bce86f]">
                      <Award className="h-3.5 w-3.5 text-[#dcf88f]" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-white/10 bg-forest-900/40 p-5 text-center backdrop-blur-md">
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            <strong className="text-[#dcf88f] font-semibold">Proudly Made in Bangladesh · </strong>
            Designed, architected, and built by Adnan, Heme, and Kushal to bring cutting-edge software to Livestock and Agriculture.
          </p>
        </div>
      </div>
    </section>
  )
}
