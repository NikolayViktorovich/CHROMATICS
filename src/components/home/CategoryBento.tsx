import { Link } from 'react-router-dom'
import type { Category } from '../../lib/types'

const SWATCHES = ['#57534e', '#78716c', '#a8a29e', '#d6d3d1', '#fafaf9', '#44403c', '#8b7355'] as const

export function CategoryBento({
  categories,
  loading,
}: {
  categories: Category[]
  loading: boolean
}) {
  if (loading && categories.length === 0) {
    return (
      <div className="home-categories overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-stone-100 px-4 py-5 last:border-b-0 sm:px-6 sm:py-6"
            aria-hidden
          >
            <div className="h-12 w-2 shrink-0 rounded-full bg-stone-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-8 rounded bg-stone-100" />
              <div className="h-5 w-2/3 max-w-xs rounded bg-stone-100" />
            </div>
            <div className="h-4 w-10 rounded bg-stone-100" />
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return <p className="text-sm text-stone-500">Категории пока не добавлены</p>
  }

  return (
    <div className="home-categories overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_20px_48px_-32px_rgba(28,25,23,0.12)]">
      {categories.map((cat, index) => {
        const swatch = SWATCHES[index % SWATCHES.length]
        const num = String(index + 1).padStart(2, '0')

        return (
          <Link
            key={cat.id}
            to={`/catalog/${cat.slug}`}
            className="home-category-row group relative flex items-stretch gap-4 border-b border-stone-100 px-4 py-5 transition-colors last:border-b-0 hover:bg-stone-50/90 sm:gap-6 sm:px-6 sm:py-6"
          >
            <span
              className="mt-1 block h-12 w-2 shrink-0 -skew-x-12 rounded-full transition-transform duration-300 group-hover:scale-y-110 sm:h-14 sm:w-2.5"
              style={{ backgroundColor: swatch }}
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <span className="font-jost text-xs font-medium tracking-[0.2em] text-stone-400">
                  {num}
                </span>
                <h3 className="font-jost text-lg font-semibold tracking-wide text-stone-900 uppercase sm:text-xl">
                  {cat.name}
                </h3>
              </div>
              {cat.description && (
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-stone-500">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end justify-center gap-1 self-center">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs tabular-nums text-stone-600 transition-colors group-hover:bg-stone-200">
                {cat.productCount}
              </span>
              <span
                className="text-lg text-stone-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-stone-900"
                aria-hidden
              >
                →
              </span>
            </div>
          </Link>
        )
      })}

      <Link
        to="/catalog"
        className="flex items-center justify-center gap-2 bg-stone-900 px-4 py-4 text-sm font-medium text-white transition-colors hover:bg-stone-800 sm:py-5"
      >
        Весь каталог
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
