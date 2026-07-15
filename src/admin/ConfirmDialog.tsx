import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type DestructiveOptions = {
  action: string
  count?: number
}

type DialogState =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'destructive'; options: DestructiveOptions; step: 1 | 2; resolve: (v: boolean) => void }

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  confirmDestructive: (action: string, count?: number) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

function DialogButtons({
  cancelLabel = 'Отмена',
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
  confirmDisabled,
}: {
  cancelLabel?: string
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-neutral-500 transition hover:text-neutral-800"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        disabled={confirmDisabled}
        onClick={onConfirm}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${
          danger
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-neutral-900 text-white hover:bg-neutral-800'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  )
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [token, setToken] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback((result: boolean) => {
    setDialog((current) => {
      current?.resolve(result)
      return null
    })
    setToken('')
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ kind: 'confirm', options, resolve })
    })
  }, [])

  const confirmDestructive = useCallback((action: string, count?: number) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ kind: 'destructive', options: { action, count }, step: 1, resolve })
    })
  }, [])

  useEffect(() => {
    if (dialog?.kind === 'destructive' && dialog.step === 2) {
      inputRef.current?.focus()
    }
  }, [dialog])

  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog, close])

  const proceedDestructive = () => {
    if (dialog?.kind !== 'destructive') return
    if (dialog.step === 1) {
      setDialog({ ...dialog, step: 2 })
      setToken('')
      return
    }
    if (token.trim() === 'УДАЛИТЬ') close(true)
  }

  return (
    <ConfirmContext.Provider value={{ confirm, confirmDestructive }}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 p-4"
          onClick={() => close(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {dialog.kind === 'confirm' ? (
              <>
                <h2 className="text-base font-semibold text-neutral-900">
                  {dialog.options.danger ? 'Удалить?' : dialog.options.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 whitespace-pre-line">
                  {dialog.options.message}
                </p>
                {dialog.options.danger && (
                  <p className="mt-2 text-sm text-red-600">Это необратимо.</p>
                )}
                <DialogButtons
                  cancelLabel={dialog.options.cancelLabel}
                  confirmLabel={
                    dialog.options.confirmLabel ?? (dialog.options.danger ? 'Удалить' : 'Ок')
                  }
                  danger={dialog.options.danger}
                  onCancel={() => close(false)}
                  onConfirm={() => close(true)}
                />
              </>
            ) : dialog.step === 1 ? (
              <>
                <h2 className="text-base font-semibold text-neutral-900">
                  {dialog.options.action}
                  {dialog.options.count != null ? ` (${dialog.options.count})` : ''}?
                </h2>
                <p className="mt-2 text-sm text-red-600">Восстановить данные будет нельзя.</p>
                <DialogButtons
                  confirmLabel="Продолжить"
                  danger
                  onCancel={() => close(false)}
                  onConfirm={proceedDestructive}
                />
              </>
            ) : (
              <>
                <h2 className="text-base font-semibold text-neutral-900">Подтверждение</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Введите <span className="font-medium text-neutral-900">УДАЛИТЬ</span>
                </p>
                <input
                  ref={inputRef}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && proceedDestructive()}
                  className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="УДАЛИТЬ"
                  autoComplete="off"
                  spellCheck={false}
                />
                <DialogButtons
                  confirmLabel="Удалить"
                  danger
                  confirmDisabled={token.trim() !== 'УДАЛИТЬ'}
                  onCancel={() => close(false)}
                  onConfirm={proceedDestructive}
                />
              </>
            )}
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirmDialog() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
  return ctx
}
