export function Spinner({ minHeight = false }: { minHeight?: boolean }) {
  return (
    <div
      className={`flex flex-1 items-center justify-center py-16 ${minHeight ? 'min-h-[50vh]' : ''}`}
      role="status"
      aria-label="Загрузка"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
    </div>
  )
}
