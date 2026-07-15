import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category, ProductInput } from '../lib/types'
import { Spinner } from '../components/Spinner'
import { Checkbox } from '../components/Checkbox'
import { useAuthGuard } from './useAuthGuard'

interface SpecRow {
  key: string
  value: string
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400'

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const handleError = useAuthGuard()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [specRows, setSpecRows] = useState<SpecRow[]>([{ key: '', value: '' }])
  const [sizes, setSizes] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    api.getCategories(true).then(setCategories)
  }, [])

  useEffect(() => {
    if (!id) return
    api
      .getProduct(id)
      .then((p) => {
        setCategoryId(p.category.id)
        setBrand(p.brand)
        setName(p.name)
        setTagline(p.tagline)
        setDescription(p.description)
        setFeaturesText(p.features.join('\n'))
        setSpecRows(
          Object.entries(p.specs).length > 0
            ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }],
        )
        setSizes(p.sizes)
        setPrice(p.price != null ? String(p.price) : '')
        setImage(p.image)
        setIsActive(p.isActive)
      })
      .catch((err) => setError(handleError(err)))
      .finally(() => setLoading(false))
  }, [id])

  const payload = useMemo((): ProductInput => {
    const specs: Record<string, string> = {}
    for (const row of specRows) {
      if (row.key.trim() && row.value.trim()) specs[row.key.trim()] = row.value.trim()
    }
    return {
      categoryId: Number(categoryId),
      brand,
      name,
      tagline,
      description,
      features: featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      specs,
      sizes,
      price: price.trim() === '' ? null : Number(price.replace(',', '.')),
      image,
      isActive,
    }
  }, [categoryId, brand, name, tagline, description, featuresText, specRows, sizes, price, image, isActive])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) await api.updateProduct(Number(id), payload)
      else await api.createProduct(payload)
      navigate('/admin')
    } catch (err) {
      setError(handleError(err))
      window.scrollTo(0, 0)
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const { url } = await api.uploadImage(file)
      setImage(url)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setUploading(false)
    }
  }

  const updateSpecRow = (index: number, patch: Partial<SpecRow>) => {
    setSpecRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin" className="text-sm text-neutral-400 hover:text-neutral-700">
          ← Товары
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Редактирование товара' : 'Новый товар'}
        </h1>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Основное</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Название *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Категория *</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Бренд</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">
                Короткое описание (подзаголовок)
              </span>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Описание</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Цена, ₽</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="Пусто — «цена по запросу»"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-neutral-700">Фасовка</span>
              <input
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="2,5 л; 5 л; 10 л"
                className={inputClass}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
              <Checkbox
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm font-medium text-neutral-700">
                Показывать товар на сайте
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Изображение</h2>
          <div className="flex items-start gap-5">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="px-2 text-center text-xs text-neutral-400">Нет изображения</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-block cursor-pointer rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200">
                {uploading ? 'Загрузка…' : 'Выбрать файл'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadImage(file)
                    e.target.value = ''
                  }}
                />
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="block text-sm text-red-600 hover:underline"
                >
                  Удалить изображение
                </button>
              )}
              <p className="text-xs text-neutral-400">PNG, JPG, WebP или GIF, до 5 МБ</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-1 font-semibold">Преимущества</h2>
          <p className="mb-3 text-sm text-neutral-400">Каждое с новой строки</p>
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={5}
            placeholder={'Легко наносится\nНе желтеет\nЭкологически безопасна'}
            className={inputClass}
          />
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Технические характеристики</h2>
          <div className="space-y-2">
            {specRows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={row.key}
                  onChange={(e) => updateSpecRow(i, { key: e.target.value })}
                  placeholder="Параметр (например, Расход)"
                  className={`${inputClass} w-2/5`}
                />
                <input
                  value={row.value}
                  onChange={(e) => updateSpecRow(i, { value: e.target.value })}
                  placeholder="Значение"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setSpecRows((rows) => rows.filter((_, j) => j !== i))}
                  aria-label="Удалить строку"
                  className="shrink-0 rounded-lg px-3 text-neutral-400 ring-1 ring-neutral-200 transition hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSpecRows((rows) => [...rows, { key: '', value: '' }])}
            className="mt-3 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
          >
            + Добавить характеристику
          </button>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-neutral-900 px-6 py-2.5 font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {saving ? 'Сохраняем…' : isEdit ? 'Сохранить изменения' : 'Создать товар'}
          </button>
          <Link to="/admin" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  )
}
