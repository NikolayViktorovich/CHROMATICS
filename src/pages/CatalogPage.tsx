import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import type { Category, ProductList } from '../lib/types'
import { ProductCard } from '../components/ProductCard'
import { Pagination } from '../components/Pagination'

const CHIP_ACCENTS = ['#78716c', '#a8a29e', '#57534e', '#d6d3d1', '#44403c'] as const

export function CatalogPage() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const brand = searchParams.get('brand') ?? ''
  const page = Number(searchParams.get('page')) || 1

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [data, setData] = useState<ProductList | null>(null)
  const [fetching, setFetching] = useState(true)
  const [mobilePanel, setMobilePanel] = useState<'category' | 'brand' | null>(null)
  const [sheetClosing, setSheetClosing] = useState(false)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getBrands()]).then(([cats, brandList]) => {
      setCategories(cats)
      setBrands(brandList)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    api
      .getProducts({ category: categorySlug, search, brand, page, perPage: 24 })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })
    return () => {
      cancelled = true
    }
  }, [categorySlug, search, brand, page])

  useEffect(() => {
    if (!mobilePanel) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobilePanel])

  useEffect(() => {
    if (!sheetClosing) return
    const timer = window.setTimeout(() => {
      setMobilePanel(null)
      setSheetClosing(false)
    }, 240)
    return () => window.clearTimeout(timer)
  }, [sheetClosing])

  const activeCategory = categories.find((c) => c.slug === categorySlug)
  const initialLoad = fetching && !data
  const pageTitle = activeCategory?.name ?? (search ? `Поиск: «${search}»` : 'Каталог')

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const catalogHref = (slug?: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (brand) params.set('brand', brand)
    const qs = params.toString()
    const path = slug ? `/catalog/${slug}` : '/catalog'
    return qs ? `${path}?${qs}` : path
  }

  const requestClosePanel = () => setSheetClosing(true)
  const openMobilePanel = (panel: 'category' | 'brand') => {
    setSheetClosing(false)
    setMobilePanel(panel)
  }

  const clearFilters = () => {
    navigate('/catalog')
  }

  const hasFilters = Boolean(categorySlug || search || brand)

  return (
    <div className="min-w-0 pb-10 sm:pb-16">
      <div className="catalog-hero px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="catalog-hero-shell relative mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem]">
          <img
            src="/catalog.png"
            alt=""
            className="catalog-hero-image"
            aria-hidden
            draggable={false}
          />
          <div className="catalog-hero-overlay" aria-hidden />
          <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-10">
            <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-stone-500">
              <Link to="/" className="transition-colors hover:text-white">
                Главная
              </Link>
              <span className="text-stone-600">/</span>
              <span className="text-stone-300">{pageTitle}</span>
            </nav>

            <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-jost text-2xl font-semibold tracking-wide text-white uppercase sm:text-3xl lg:text-4xl">
                  {pageTitle}
                </h1>
                {activeCategory?.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
                    {activeCategory.description}
                  </p>
                )}
                {search && (
                  <p className="mt-2 text-sm text-stone-400">
                    По запросу «{search}»
                    <button
                      type="button"
                      onClick={() => updateParam('search', '')}
                      className="ml-2 text-stone-500 underline-offset-2 hover:text-white hover:underline"
                    >
                      сбросить
                    </button>
                  </p>
                )}
              </div>
              {!initialLoad && data && (
                <p className="shrink-0 text-sm text-stone-500">
                  {data.total} {pluralProducts(data.total)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="catalog-toolbar sticky top-14 z-10 -mx-1 mt-5 rounded-2xl border border-stone-200/80 bg-white/95 px-3 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex gap-2 lg:hidden">
            <MobileFilterButton
              label="Категория"
              value={activeCategory?.name ?? 'Все товары'}
              active={Boolean(categorySlug)}
              onClick={() => openMobilePanel('category')}
            />
            {brands.length > 1 && (
              <MobileFilterButton
                label="Бренд"
                value={brand || 'Все'}
                active={Boolean(brand)}
                onClick={() => openMobilePanel('brand')}
              />
            )}
          </div>

          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-0.5 lg:mt-0">
            <FilterChip to={catalogHref()} active={!categorySlug}>
              Все
            </FilterChip>
            {categories.map((cat, i) => (
              <FilterChip
                key={cat.id}
                to={catalogHref(cat.slug)}
                active={cat.slug === categorySlug}
                accent={CHIP_ACCENTS[i % CHIP_ACCENTS.length]}
              >
                {cat.name}
                <span className="ml-1.5 tabular-nums opacity-60">{cat.productCount}</span>
              </FilterChip>
            ))}
          </div>

          {brands.length > 1 && (
            <div className="scrollbar-none mt-2 hidden gap-2 overflow-x-auto pb-0.5 lg:flex">
              <button
                type="button"
                onClick={() => updateParam('brand', '')}
                className={`catalog-chip shrink-0 ${!brand ? 'catalog-chip-active' : ''}`}
              >
                Все бренды
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => updateParam('brand', brand === b ? '' : b)}
                  className={`catalog-chip shrink-0 ${brand === b ? 'catalog-chip-active' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {hasFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 lg:border-0 lg:pt-2">
              {categorySlug && activeCategory && (
                <ActiveFilterTag label={activeCategory.name} onRemove={() => navigate(catalogHref())} />
              )}
              {brand && <ActiveFilterTag label={brand} onRemove={() => updateParam('brand', '')} />}
              {search && (
                <ActiveFilterTag label={`«${search}»`} onRemove={() => updateParam('search', '')} />
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-stone-500 underline-offset-2 hover:text-stone-900 hover:underline"
              >
                Сбросить всё
              </button>
            </div>
          )}
        </div>

        {mobilePanel && (
          <MobileSheet
            title={mobilePanel === 'category' ? 'Категория' : 'Бренд'}
            closing={sheetClosing}
            onClose={requestClosePanel}
          >
            {mobilePanel === 'category' ? (
              <ul className="overflow-hidden rounded-xl border border-stone-200">
                <li>
                  <MobileFilterLink
                    to={catalogHref()}
                    active={!categorySlug}
                    onNavigate={requestClosePanel}
                  >
                    Все товары
                  </MobileFilterLink>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id} className="border-t border-stone-100">
                    <MobileFilterLink
                      to={catalogHref(cat.slug)}
                      active={cat.slug === categorySlug}
                      onNavigate={requestClosePanel}
                      count={cat.productCount}
                    >
                      {cat.name}
                    </MobileFilterLink>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="overflow-hidden rounded-xl border border-stone-200">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('brand', '')
                      requestClosePanel()
                    }}
                    className={`flex w-full items-center px-4 py-3 text-left text-sm transition-colors ${
                      !brand
                        ? 'bg-stone-900 font-medium text-white'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    Все бренды
                  </button>
                </li>
                {brands.map((b) => (
                  <li key={b} className="border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        updateParam('brand', brand === b ? '' : b)
                        requestClosePanel()
                      }}
                      className={`flex w-full items-center px-4 py-3 text-left text-sm transition-colors ${
                        brand === b
                          ? 'bg-stone-900 font-medium text-white'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {b}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </MobileSheet>
        )}

        <div className="mt-6 lg:mt-8">
          {initialLoad ? (
            <ProductGridSkeleton />
          ) : data && data.items.length > 0 ? (
            <div className={fetching ? 'content-dimmed' : ''}>
              {data.totalPages > 1 && (
                <p className="mb-4 text-sm text-stone-500">
                  Страница {data.page} из {data.totalPages}
                </p>
              )}
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-3">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(p) => updateParam('page', String(p))}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-16 text-center sm:py-20">
              <p className="font-medium text-stone-700">Ничего не найдено</p>
              <p className="mt-1 text-sm text-stone-500">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  children,
  to,
  active,
  accent,
}: {
  children: React.ReactNode
  to: string
  active: boolean
  accent?: string
}) {
  return (
    <Link
      to={to}
      className={`catalog-chip shrink-0 ${active ? 'catalog-chip-active' : ''}`}
      style={active && accent ? { borderColor: accent } : undefined}
    >
      {children}
    </Link>
  )
}

function ActiveFilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 py-1 pl-3 pr-1.5 text-xs text-stone-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-5 w-5 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900"
        aria-label={`Убрать фильтр ${label}`}
      >
        ×
      </button>
    </span>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white"
          aria-hidden
        >
          <div className="aspect-[4/3] bg-stone-50" />
          <div className="space-y-2 p-4 sm:p-5">
            <div className="h-3 w-1/3 rounded bg-stone-100" />
            <div className="h-4 w-full rounded bg-stone-100" />
            <div className="h-4 w-2/3 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MobileFilterButton({
  label,
  value,
  active,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left transition-colors hover:bg-stone-50 ${
        active ? 'border-stone-900' : 'border-stone-200'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-stone-400">{label}</span>
        <span className="block truncate text-sm font-medium text-stone-900">{value}</span>
      </span>
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-stone-400" aria-hidden>
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

function MobileSheet({
  title,
  closing,
  onClose,
  children,
}: {
  title: string
  closing: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className={`absolute inset-0 bg-stone-900/50 ${closing ? 'sheet-backdrop-out' : 'sheet-backdrop-in'}`}
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white ${
          closing ? 'sheet-panel-out' : 'sheet-panel-in'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4">
          <h2 className="text-base font-medium text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-100"
          >
            Готово
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
      </div>
    </div>
  )
}

function MobileFilterLink({
  children,
  to,
  active,
  count,
  onNavigate,
}: {
  children: React.ReactNode
  to: string
  active: boolean
  count?: number
  onNavigate: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
        active ? 'bg-stone-900 font-medium text-white' : 'text-stone-700 hover:bg-stone-50'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className={`tabular-nums ${active ? 'text-white/60' : 'text-stone-400'}`}>{count}</span>
      )}
    </Link>
  )
}

function pluralProducts(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'товар'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара'
  return 'товаров'
}
