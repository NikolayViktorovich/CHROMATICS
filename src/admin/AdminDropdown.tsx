import { useEffect, useId, useRef, useState } from 'react'

export type DropdownOption = {
  value: string
  label: string
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function AdminDropdown({
  value,
  options,
  onChange,
  placeholder = 'Выберите…',
  className = '',
}: {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)
  const label = selected?.label ?? placeholder

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (next: string) => {
    onChange(next)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-[12rem] items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-800 transition hover:border-neutral-300 focus:border-neutral-400 focus:outline-none"
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+4px)] z-20 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <li key={opt.value || '__all__'} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => pick(opt.value)}
                  className={`flex w-full px-3 py-2 text-left text-sm transition ${
                    active
                      ? 'bg-neutral-100 font-medium text-neutral-900'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
