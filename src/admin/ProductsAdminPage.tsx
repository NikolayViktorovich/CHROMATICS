import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category, ProductList } from '../lib/types'
import { Pagination } from '../components/Pagination'
import { Spinner } from '../components/Spinner'
import { ProductImage } from '../components/ProductImage'
import { useAuthGuard } from './useAuthGuard'
import { useConfirmDialog } from './ConfirmDialog'
import { DangerLink, SelectionToolbar } from './SelectionToolbar'
import { AdminDropdown } from './AdminDropdown'
import { RowActions } from './RowActions'
import { Checkbox } from '../components/Checkbox'

export function ProductsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''

  const [data, setData] = useState<ProductList | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const handleError = useAuthGuard()
  const { confirm, confirmDestructive } = useConfirmDialog()

  const load = useCallback(() => {
    setLoading(true)
    api
      .getProducts({ page, category, search, all: 1, perPage: 20 })
      .then(setData)
      .catch((err) => setError(handleError(err)))
      .finally(() => setLoading(false))
  }, [page, category, search])

  useEffect(() => {
    api.getCategories(true).then(setCategories)
  }, [])

  useEffect(load, [load])

  useEffect(() => {
    setSelected(new Set())
  }, [page, category, search])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const pageIds = data?.items.map((p) => p.id) ?? []
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someOnPageSelected =
    pageIds.length > 0 && pageIds.some((id) => selected.has(id)) && !allOnPageSelected

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPageSelected) {
        for (const id of pageIds) next.delete(id)
      } else {
        for (const id of pageIds) next.add(id)
      }
      return next
    })
  }

  const removeOne = async (id: number, name: string) => {
    const ok = await confirm({
      title: 'Удалить товар',
      message: `Будет удалён товар «${name}».`,
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    setError('')
    try {
      await api.deleteProduct(id)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  const removeSelected = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    if (!(await confirmDestructive('Удалить выбранные товары', ids.length))) return

    setBusy(true)
    setError('')
    try {
      const { deleted } = await api.bulkDeleteProducts({ ids })
      setSelected(new Set())
      load()
      if (deleted < ids.length) {
        setError(`Удалено ${deleted} из ${ids.length} товаров`)
      }
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  const removeAll = async () => {
    if (!data?.total) return
    if (!(await confirmDestructive('Удалить ВСЕ товары из базы', data.total))) return

    setBusy(true)
    setError('')
    try {
      await api.bulkDeleteProducts({ all: true })
      setSelected(new Set())
      load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
          {data && (
            <p className="mt-1 text-sm text-neutral-500">
              {data.total} позиций
              {data.total > 0 && (
                <>
                  {' · '}
                  <DangerLink
                    label={`Удалить все (${data.total})`}
                    onClick={removeAll}
                    disabled={busy}
                  />
                </>
              )}
            </p>
          )}
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          + Добавить товар
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
          placeholder="Поиск…"
          className="w-64 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400"
        />
        <AdminDropdown
          value={category}
          onChange={(v) => updateParam('category', v)}
          placeholder="Все категории"
          options={[
            { value: '', label: 'Все категории' },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
      </div>

      <SelectionToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        disabled={busy}
      >
        <button
          type="button"
          disabled={busy}
          onClick={removeSelected}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Удалить выбранные
        </button>
      </SelectionToolbar>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected}
                    onChange={togglePage}
                    disabled={!pageIds.length || busy}
                    aria-label="Выбрать все на странице"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Товар</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Категория</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Цена</th>
                <th className="w-36 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.items.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-neutral-50/60 ${selected.has(p.id) ? 'bg-neutral-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      disabled={busy}
                      aria-label={`Выбрать ${p.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                        <ProductImage product={p} className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-neutral-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 md:table-cell">
                    {p.category.name}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {p.price != null ? `${p.price.toLocaleString('ru-RU')} ₽` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      editTo={`/admin/products/${p.id}`}
                      onDelete={() => removeOne(p.id, p.name)}
                      disabled={busy}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-400">Товары не найдены</p>
          )}
        </div>
      )}

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={(p) => updateParam('page', String(p))}
        />
      )}
    </div>
  )
}
