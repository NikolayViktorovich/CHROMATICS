import { useEffect, useRef } from 'react'

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  indeterminate?: boolean
}

export function Checkbox({ indeterminate, className = '', disabled, checked, ...props }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.indeterminate = Boolean(indeterminate)
  }, [indeterminate, checked])

  const showCheck = Boolean(checked) && !indeterminate
  const showDash = Boolean(indeterminate)

  return (
    <label
      className={`inline-flex shrink-0 items-center ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      } ${className}`}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition ${
          showCheck || showDash
            ? 'border-neutral-800 bg-neutral-800'
            : 'border-neutral-300 bg-white hover:border-neutral-400'
        } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-800`}
        aria-hidden
      >
        {showCheck && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {showDash && <span className="h-0.5 w-2 rounded-full bg-white" />}
      </span>
    </label>
  )
}
