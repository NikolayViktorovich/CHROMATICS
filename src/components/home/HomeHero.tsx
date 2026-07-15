import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const SWATCHES = ['#e5b800', '#a8a29e', '#d6d3d1', '#78716c', '#fafaf9'] as const
const TRIM_END_SECONDS = 3

export function HomeHero({
  totalProducts,
  loading,
}: {
  totalProducts: number
  loading: boolean
}) {
  const [visible, setVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const endTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const setEndTime = () => {
      if (!Number.isFinite(video.duration) || video.duration <= TRIM_END_SECONDS) {
        endTimeRef.current = null
        return
      }
      endTimeRef.current = video.duration - TRIM_END_SECONDS
    }

    const loopBeforeTail = () => {
      const endTime = endTimeRef.current
      if (endTime == null) return
      if (video.currentTime >= endTime - 0.05) {
        video.currentTime = 0
        void video.play()
      }
    }

    video.addEventListener('loadedmetadata', setEndTime)
    video.addEventListener('durationchange', setEndTime)
    video.addEventListener('timeupdate', loopBeforeTail)

    if (video.readyState >= 1) setEndTime()

    return () => {
      video.removeEventListener('loadedmetadata', setEndTime)
      video.removeEventListener('durationchange', setEndTime)
      video.removeEventListener('timeupdate', loopBeforeTail)
    }
  }, [])

  return (
    <section className="home-hero px-4 pt-4 pb-2 sm:px-6 sm:pt-8 sm:pb-4 lg:pt-10">
      <div className="home-hero-shell relative mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] lg:rounded-[2rem]">
        <video
          ref={videoRef}
          className="home-hero-video"
          src="/chrom.MP4"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="home-hero-video-overlay" aria-hidden />
        <div className="home-hero-grid absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="home-hero-vignette absolute inset-0" aria-hidden />

        <div
          className={`relative z-10 flex min-h-[22rem] flex-col justify-end px-5 py-8 sm:min-h-[26rem] sm:px-8 sm:py-12 lg:min-h-[32rem] lg:justify-center lg:py-16 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ transition: 'opacity 1s ease, transform 1s ease' }}
        >
          <div className="max-w-xl">
            <div className="mb-4 flex items-end gap-2 sm:mb-6 sm:gap-3" aria-hidden>
              {SWATCHES.map((color) => (
                <span
                  key={color}
                  className="block h-6 w-1.5 -skew-x-12 rounded-full sm:h-8 sm:w-2"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <h1 className="font-jost text-[clamp(2.25rem,10vw,4.75rem)] font-semibold leading-[0.95] tracking-[0.06em] text-white uppercase">
              Хроматика
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300 sm:mt-5 sm:text-base lg:text-lg">
              Краски, грунты и декоративные покрытия для интерьера и фасада — подберите оттенок и
              фактуру под ваш проект.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              <Link
                to="/catalog"
                className="inline-flex w-full items-center justify-center rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-stone-900 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-7"
              >
                Смотреть каталог
              </Link>
              <p className="w-full text-center text-sm text-stone-400 sm:w-auto sm:text-left">
                {loading ? '…' : `${totalProducts} позиций в каталоге`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
