import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Category } from '../lib/types'
import { Spinner } from '../components/Spinner'
import { useAuthGuard } from './useAuthGuard'
import { useConfirmDialog } from './ConfirmDialog'
import { DangerLink, SelectionToolbar } from './SelectionToolbar'
import { RowActions } from './RowActions'
import { Checkbox } from '../components/Checkbox'

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400'

export function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const handleError = useAuthGuard()
  const { confirm, confirmDestructive } = useConfirmDialog()

  const load = useCallback(() => {
    setLoading(true)
    api
      .getCategories(true)
      .then(setCategories)
      .catch((err) => setError(handleError(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const allSelected = categories.length > 0 && categories.every((c) => selected.has(c.id))
  const someSelected =
    categories.length > 0 && categories.some((c) => selected.has(c.id)) && !allSelected

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(categories.map((c) => c.id)))
  }

  const removeOne = async (cat: Category) => {
    const ok = await confirm({
      title: 'Удалить категорию',
      message: `Будет удалена категория «${cat.name}». Работает только для пустых категорий.`,
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    setError('')
    try {
      await api.deleteCategory(cat.id)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(cat.id)
        return next
      })
      load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  const removeSelected = async (force: boolean) => {
    const ids = [...selected]
    if (ids.length === 0) return

    const label = force
      ? 'Удалить выбранные категории вместе с товарами'
      : 'Удалить выбранные пустые категории'
    if (!(await confirmDestructive(label, ids.length))) return

    setBusy(true)
    setError('')
    try {
      const result = await api.bulkDeleteCategories({ ids, force })
      setSelected(new Set())
      load()
      if (result.skipped > 0 && !force) {
        setError(
          `Удалено категорий: ${result.deleted}. Пропущено (есть товары): ${result.skipped}. Используйте «Удалить с товарами».`,
        )
      }
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  const removeAll = async () => {
    if (!categories.length) return
    const totalProducts = categories.reduce((s, c) => s + (c.productCount ?? 0), 0)
    if (
      !(await confirmDestructive(
        `Удалить ВСЕ категории${totalProducts ? ` и ${totalProducts} товаров` : ''}`,
        categories.length,
      ))
    ) {
      return
    }

    setBusy(true)
    setError('')
    try {
      await api.bulkDeleteCategories({ all: true, force: true })
      setSelected(new Set())
      load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Категории</h1>
          {categories.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              {categories.length} разделов
              {' · '}
              <DangerLink
                label={`Удалить все (${categories.length})`}
                onClick={removeAll}
                disabled={busy}
              />
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true)
            setEditing(null)
          }}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          + Добавить категорию
        </button>
      </div>

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        disabled={busy}
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => removeSelected(false)}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Удалить пустые
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => removeSelected(true)}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Удалить с товарами
        </button>
      </SelectionToolbar>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {(creating || editing) && (
        <CategoryForm
          category={editing}
          onDone={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onError={(err) => setError(handleError(err))}
        />
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    disabled={!categories.length || busy}
                    aria-label="Выбрать все категории"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Название</th>
                <th className="px-4 py-3 font-semibold">Товаров</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className={`hover:bg-neutral-50/60 ${selected.has(cat.id) ? 'bg-neutral-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(cat.id)}
                      onChange={() => toggleOne(cat.id)}
                      disabled={busy}
                      aria-label={`Выбрать ${cat.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">
                        {cat.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{cat.productCount}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => {
                        setEditing(cat)
                        setCreating(false)
                        window.scrollTo(0, 0)
                      }}
                      onDelete={() => removeOne(cat)}
                      disabled={busy}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CategoryForm({
  category,
  onDone,
  onCancel,
  onError,
}: {
  category: Category | null
  onDone: () => void
  onCancel: () => void
  onError: (err: unknown) => void
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0))
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { name, description, sortOrder: Number(sortOrder) || 0 }
      if (category) await api.updateCategory(category.id, data)
      else await api.createCategory(data)
      onDone()
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 font-semibold">
        {category ? `Редактирование: ${category.name}` : 'Новая категория'}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Название *</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Порядок сортировки
          </span>
          <input
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            inputMode="numeric"
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Описание</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
