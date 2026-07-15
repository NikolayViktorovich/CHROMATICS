import type { ButtonHTMLAttributes } from 'react'

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const items = buildPageItems(page, totalPages)

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1 sm:gap-1.5"
      aria-label="Пагинация"
    >
      <NavButton
        label="Назад"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        direction="prev"
      />

      <div className="flex items-center gap-1">
        {items.map((item, i) =>
          item === '…' ? (
            <span
              key={`gap-${i}`}
              className="flex h-9 min-w-9 items-center justify-center text-sm text-zinc-400 select-none"
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              label={String(item)}
              active={item === page}
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
            />
          ),
        )}
      </div>

      <NavButton
        label="Вперёд"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        direction="next"
      />
    </nav>
  )
}

function Chevron({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-4 w-4 shrink-0 ${direction === 'next' ? 'rotate-180' : ''}`}
    >
      <path
        fillRule="evenodd"
        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function NavButton({
  label,
  disabled,
  onClick,
  direction,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  direction: 'prev' | 'next'
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition select-none ${
        disabled
          ? 'cursor-not-allowed text-zinc-300'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      } ${direction === 'next' ? 'flex-row-reverse' : ''}`}
    >
      <Chevron direction={direction} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function PageButton({
  label,
  active,
  onClick,
  ...rest
}: {
  label: string
  active?: boolean
  onClick: () => void
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition select-none ${
        active
          ? 'bg-zinc-900 text-white'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
      {...rest}
    >
      {label}
    </button>
  )
}

function buildPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, total])
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }

  return result
}
