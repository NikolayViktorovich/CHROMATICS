import type { ReactNode } from 'react'

export function ExpandableSection({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="product-disclosure group overflow-hidden rounded-2xl border border-stone-200/80 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="font-jost text-sm font-semibold tracking-wide text-stone-900 uppercase sm:text-[0.9375rem]">
            {title}
          </span>
          {badge && (
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
              {badge}
            </span>
          )}
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-stone-100 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </details>
  )
}
