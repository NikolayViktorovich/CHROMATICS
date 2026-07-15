import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25

export function ImageLightbox({
  src,
  alt,
  children,
}: {
  src: string
  alt: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const close = useCallback(() => {
    setOpen(false)
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => {
    setZoom((z) => {
      const next = Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))
      if (next === ZOOM_MIN) setPan({ x: 0, y: 0 })
      return next
    })
  }
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') resetView()
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close])

  const onPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (zoom <= 1) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging) return
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x) / zoom,
      y: dragStart.current.panY + (e.clientY - dragStart.current.y) / zoom,
    })
  }

  const onPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative mx-auto flex w-full cursor-zoom-in items-center justify-center border-0 bg-transparent p-0"
        aria-label="Открыть изображение"
      >
        {children}
        <span className="pointer-events-none absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-stone-600 opacity-0 shadow-sm ring-1 ring-stone-200/80 transition-opacity group-hover:opacity-100">
          <ExpandIcon />
        </span>
      </button>

      {open &&
        createPortal(
          <div className="lightbox-root fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label={alt}>
            <div className="lightbox-backdrop absolute inset-0 bg-stone-950/90 backdrop-blur-md" onClick={close} />

            <div className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="min-w-0 truncate text-sm text-white/70">{alt}</p>
              <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/10">
                <ViewerButton onClick={zoomOut} disabled={zoom <= ZOOM_MIN} label="Уменьшить">
                  <MinusIcon />
                </ViewerButton>
                <button
                  type="button"
                  onClick={resetView}
                  className="w-12 px-1 text-center text-xs tabular-nums text-white/80 transition-colors hover:text-white"
                  title="Сбросить (0)"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <ViewerButton onClick={zoomIn} disabled={zoom >= ZOOM_MAX} label="Увеличить">
                  <PlusIcon />
                </ViewerButton>
                <span className="mx-0.5 h-5 w-px bg-white/15" aria-hidden />
                <ViewerButton onClick={close} label="Закрыть">
                  <CloseIcon />
                </ViewerButton>
              </div>
            </div>

            <div
              className="relative z-10 flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8"
              onClick={close}
              onWheel={onWheel}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className={`lightbox-image max-h-[78vh] max-w-[min(92vw,56rem)] select-none object-contain transition-transform duration-150 ease-out ${
                  zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                }`}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (zoom === 1) zoomIn()
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              />
            </div>

            <p className="relative z-10 pb-4 text-center text-xs text-white/40">
              Колёсико или ± для масштаба · перетаскивание при увеличении · Esc — закрыть
            </p>
          </div>,
          document.body,
        )}
    </>
  )
}

function ViewerButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
      <path d="M8 3H3v5M12 3h5v5M12 17h5v-5M8 17H3v-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
      <path d="M4 10h12" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  )
}
