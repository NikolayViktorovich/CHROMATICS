import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const SWATCHES = [
  { color: '#e5b800', label: 'accent' },
  { color: '#a8a29e', label: 'stone-400' },
  { color: '#d6d3d1', label: 'stone-300' },
  { color: '#78716c', label: 'stone-500' },
  { color: '#fafaf9', label: 'stone-50' },
] as const

const MIN_VISIBLE_MS = 3200
const EXIT_MS = 900

/** Рывки загрузки: [задержка мс, прогресс 0–1] */
const LOADING_TICKS: Array<[number, number]> = [
  [0, 0],
  [180, 0.07],
  [420, 0.19],
  [620, 0.2],
  [780, 0.34],
  [1040, 0.36],
  [1180, 0.36],
  [1320, 0.49],
  [1580, 0.52],
  [1760, 0.52],
  [1940, 0.64],
  [2220, 0.67],
  [2440, 0.67],
  [2620, 0.78],
  [2860, 0.81],
  [3080, 0.84],
]

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter')
  const [logoReady, setLogoReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const img = new Image()
    img.src = '/logo.png'
    img.onload = () => setLogoReady(true)
    img.onerror = () => setLogoReady(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!logoReady || phase === 'exit') return

    if (reducedMotion) {
      setProgress(0.84)
      return
    }

    const timers = LOADING_TICKS.map(([delay, value]) =>
      window.setTimeout(() => setProgress(value), delay),
    )

    return () => timers.forEach(window.clearTimeout)
  }, [logoReady, phase, reducedMotion])

  useEffect(() => {
    if (!logoReady) return

    const started = Date.now()

    const beginExit = () => {
      const elapsed = Date.now() - started
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      window.setTimeout(() => setPhase('exit'), reducedMotion ? 500 : remaining)
    }

    if (document.readyState === 'complete') beginExit()
    else window.addEventListener('load', beginExit, { once: true })

    return () => {
      window.removeEventListener('load', beginExit)
    }
  }, [logoReady, reducedMotion])

  useEffect(() => {
    if (phase !== 'exit') return
    const timer = window.setTimeout(onDone, reducedMotion ? 250 : EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [phase, onDone, reducedMotion])

  const exiting = phase === 'exit'
  const displayProgress = exiting ? 1 : progress

  return createPortal(
    <div
      className={`splash-root ${exiting ? 'splash-root-out' : ''}`}
      aria-hidden={exiting}
      role="presentation"
    >
      <div className="splash-bg" aria-hidden>
        <div className="splash-gradient" />
        <div className="splash-blob splash-blob-a" />
        <div className="splash-blob splash-blob-b" />
        <div className="splash-blob splash-blob-c" />
        <div className="splash-grain" />
        <div className="splash-vignette" />
      </div>

      <div className="splash-swatches-wrap" aria-hidden>
        <div className="splash-swatches">
          {SWATCHES.map(({ color, label }, index) => (
            <span
              key={label}
              className="splash-swatch splash-swatch-in"
              style={{
                backgroundColor: color,
                animationDelay: reducedMotion ? '0ms' : `${index * 95}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <div className={`splash-stage ${exiting ? 'splash-stage-out' : ''}`}>
        <div className={`splash-logo-wrap ${exiting ? 'splash-logo-wrap-out' : 'splash-logo-wrap-in'}`}>
          <img
            src="/logo.png"
            alt="Хроматика"
            className={`splash-logo-main ${exiting ? 'splash-logo-main-out' : 'splash-logo-main-in'}`}
            draggable={false}
          />
        </div>
      </div>

      <div
        className={`splash-bar ${exiting ? 'splash-bar-done' : ''}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayProgress * 100)}
        aria-label="Загрузка"
      >
        <div
          className="splash-bar-fill"
          style={{ transform: `scaleX(${displayProgress})` }}
        />
      </div>
    </div>,
    document.body,
  )
}
