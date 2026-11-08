import { useEffect, useRef } from 'react'

export default function CursorPollenTrail({ mood = 'morning' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Only run on non-touch desktop devices
    if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) {
      return
    }

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let particles = []
    let mouse = { x: -100, y: -100, lastX: -100, lastY: -100, speed: 0 }

    const resize = () => {
      if (!canvas) return
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth
      canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Palette per mood
    const getParticleColor = () => {
      switch (mood) {
        case 'meadow':
          return Math.random() > 0.5 ? 'rgba(110, 231, 168, ' : 'rgba(253, 224, 71, '
        case 'harvest':
          return Math.random() > 0.4 ? 'rgba(251, 191, 36, ' : 'rgba(245, 158, 11, '
        case 'dusk':
          return Math.random() > 0.5 ? 'rgba(45, 212, 191, ' : 'rgba(254, 240, 138, '
        case 'morning':
        default:
          return Math.random() > 0.5 ? 'rgba(254, 215, 102, ' : 'rgba(167, 243, 208, '
      }
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - mouse.lastX
      const dy = y - mouse.lastY
      const dist = Math.hypot(dx, dy)

      mouse.speed = dist
      mouse.lastX = mouse.x
      mouse.lastY = mouse.y
      mouse.x = x
      mouse.y = y

      // Emit particles on movement (spawn rate proportional to movement, max 3 per event)
      if (dist > 3 && particles.length < 50) {
        const count = Math.min(Math.floor(dist / 8) + 1, 3)
        for (let i = 0; i < count; i++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 1.2 + dx * 0.04,
            vy: (Math.random() - 0.5) * 1.2 - Math.random() * 0.8,
            radius: Math.random() * 2.2 + 1,
            colorBase: getParticleColor(),
            alpha: Math.random() * 0.55 + 0.4,
            decay: Math.random() * 0.015 + 0.01,
          })
        }
      }
    }

    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.015 // gentle buoyancy like dandelion fluff
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.colorBase}${p.alpha})`
        ctx.shadowBlur = 8
        ctx.shadowColor = `${p.colorBase}0.8)`
        ctx.fill()
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [mood])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    />
  )
}
