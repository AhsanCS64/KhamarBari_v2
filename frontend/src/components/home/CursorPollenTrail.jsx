
import { useEffect, useRef } from 'react'

export default function CursorPollenTrail({ mood = 'morning' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    let animationFrameId
    let particles = []
    let lastFrame = 0
    let lastSpawn = 0

    const MAX_PARTICLES = 65
    const PARTICLE_SPACING = 7
    const FRAME_INTERVAL = 1000 / 60

    const mouse = {
      x: -100,
      y: -100,
      lastX: -100,
      lastY: -100,
      active: false,
    }

    const palettes = {
      meadow: ['110, 231, 168', '253, 224, 71'],
      harvest: ['251, 191, 36', '245, 158, 11'],
      dusk: ['45, 212, 191', '254, 240, 138'],
      morning: ['254, 215, 102', '167, 243, 208'],
    }

    const palette = palettes[mood] || palettes.morning

    const random = (min, max) => Math.random() * (max - min) + min

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)

      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(resize)
        : null

    resizeObserver?.observe(parent)

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (!mouse.active) {
        mouse.x = mouse.lastX = x
        mouse.y = mouse.lastY = y
        mouse.active = true
        return
      }

      const dx = x - mouse.x
      const dy = y - mouse.y
      const distance = Math.hypot(dx, dy)

      mouse.lastX = mouse.x
      mouse.lastY = mouse.y
      mouse.x = x
      mouse.y = y

      if (distance < 3 || particles.length >= MAX_PARTICLES) return

      const count = Math.min(
        Math.ceil(distance / PARTICLE_SPACING),
        3,
        MAX_PARTICLES - particles.length
      )

      for (let i = 0; i < count; i++) {
        const progress = (i + 1) / count

        particles.push({
          x: mouse.lastX + dx * progress + random(-5, 5),
          y: mouse.lastY + dy * progress + random(-5, 5),

          vx: random(-0.45, 0.45) + dx * 0.012,
          vy: random(-0.8, 0.3) + dy * 0.008,

          radius: random(0.9, 2.5),
          alpha: random(0.45, 0.85),
          decay: random(0.009, 0.017),

          drift: random(-0.3, 0.3),
          phase: random(0, Math.PI * 2),

          color: palette[Math.floor(Math.random() * palette.length)],
        })
      }
    }

    parent.addEventListener('mousemove', handleMouseMove, {
      passive: true,
    })

    const render = (timestamp) => {
      animationFrameId = requestAnimationFrame(render)

      if (timestamp - lastFrame < FRAME_INTERVAL) return

      const delta = Math.min(
        (timestamp - (lastFrame || timestamp)) / 16.67,
        2
      )

      lastFrame = timestamp

      const width = canvas.clientWidth
      const height = canvas.clientHeight

      ctx.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        p.x += p.vx * delta
        p.y += p.vy * delta

        p.vy -= 0.012 * delta
        p.vx += p.drift * 0.002 * delta
        p.phase += 0.035 * delta

        p.x += Math.sin(p.phase) * 0.12 * delta
        p.alpha -= p.decay * delta

        if (p.alpha <= 0) {
          particles[i] = particles[particles.length - 1]
          particles.pop()
          continue
        }

        const alpha = Math.max(0, p.alpha)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)

        ctx.fillStyle = `rgba(${p.color}, ${alpha})`
        ctx.fill()

        // Subtle glow without expensive shadowBlur per particle.
        if (p.radius > 1.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2)

          ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.12})`
          ctx.fill()
        }
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)

      resizeObserver?.disconnect()

      parent.removeEventListener('mousemove', handleMouseMove)

      particles.length = 0
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
