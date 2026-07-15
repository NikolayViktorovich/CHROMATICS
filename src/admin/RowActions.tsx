import { Link } from 'react-router-dom'

export function RowActions({
  editTo,
  onEdit,
  onDelete,
  disabled,
}: {
  editTo?: string
  onEdit?: () => void
  onDelete: () => void
  disabled?: boolean
}) {
  const editClass =
    'rounded-md px-2 py-1 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900'

  return (
    <div className="flex items-center justify-end gap-0.5 whitespace-nowrap">
      {editTo ? (
        <Link to={editTo} className={editClass}>
          Изменить
        </Link>
      ) : (
        <button type="button" disabled={disabled} onClick={onEdit} className={editClass}>
          Изменить
        </button>
      )}
      <span className="px-1 text-neutral-300" aria-hidden>
        ·
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        className="rounded-md px-2 py-1 text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  )
}
