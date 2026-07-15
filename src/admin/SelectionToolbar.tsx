import type { ReactNode } from 'react'

export function SelectionToolbar({
  count,
  onClear,
  disabled,
  children,
}: {
  count: number
  onClear: () => void
  disabled?: boolean
  children: ReactNode
}) {
  if (count === 0) return null

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-zinc-700">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-zinc-900 px-1.5 text-xs font-semibold text-white tabular-nums">
          {count}
        </span>
        <span>выбрано</span>
      </div>

      <div className="hidden h-5 w-px bg-zinc-200 sm:block" aria-hidden />

      <div className="flex flex-wrap items-center gap-2">{children}</div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClear}
        className="ml-auto text-sm text-zinc-500 transition hover:text-zinc-900 disabled:opacity-50"
      >
        Снять выбор
      </button>
    </div>
  )
}

export function DangerLink({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-sm text-red-600 transition hover:text-red-800 disabled:opacity-50"
    >
      {label}
    </button>
  )
}
