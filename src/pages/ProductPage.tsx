import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import type { Product } from '../lib/types'
import { ExpandableSection } from '../components/ExpandableSection'
import { ProductImage } from '../components/ProductImage'
import { ImageLightbox } from '../components/ImageLightbox'
import { Spinner } from '../components/Spinner'
import { NotFoundPage } from './NotFoundPage'

const DESCRIPTION_COLLAPSE_AT = 260
const FEATURES_COLLAPSE_AT = 5
const SPECS_COLLAPSE_AT = 6

export function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setFetching(true)
    setNotFound(false)
    api
      .getProduct(slug)
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch((err) => {
        if (!cancelled && err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })
    window.scrollTo(0, 0)
    return () => {
      cancelled = true
    }
  }, [slug])

  if (fetching && !product) return <Spinner minHeight />
  if (notFound || !product) return <NotFoundPage />

  const specEntries = Object.entries(product.specs)
  const descriptionLong = product.description.length > DESCRIPTION_COLLAPSE_AT
  const featuresLong = product.features.length > FEATURES_COLLAPSE_AT
  const specsLong = specEntries.length > SPECS_COLLAPSE_AT

  return (
    <div className={`product-page pb-12 sm:pb-16 ${fetching ? 'content-dimmed' : ''}`}>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <nav
          className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-stone-500 sm:text-sm"
          aria-label="Хлебные крошки"
        >
          <Link to="/" className="transition-colors hover:text-stone-900">
            Главная
          </Link>
          <span className="text-stone-300">/</span>
          <Link to="/catalog" className="transition-colors hover:text-stone-900">
            Каталог
          </Link>
          <span className="text-stone-300">/</span>
          <Link
            to={`/catalog/${product.category.slug}`}
            className="transition-colors hover:text-stone-900"
          >
            {product.category.name}
          </Link>
          <span className="hidden text-stone-300 sm:inline">/</span>
          <span className="hidden line-clamp-1 min-w-0 text-stone-700 sm:inline">{product.name}</span>
        </nav>

        <div className="product-layout mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,26rem)_1fr] xl:gap-10">
          <div className="product-hero-media-shell overflow-hidden rounded-[1.25rem] border border-stone-200/80 bg-white sm:rounded-[1.75rem] lg:sticky lg:top-[4.75rem]">
            <div className="product-hero-media relative flex items-center justify-center p-6 sm:p-8 lg:p-10">
              <div className="product-hero-media-bg absolute inset-0" aria-hidden />
              {product.image ? (
                <ImageLightbox src={product.image} alt={product.name}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="relative z-10 aspect-square w-full max-w-[15rem] object-contain sm:max-w-[18rem] lg:max-w-full"
                  />
                </ImageLightbox>
              ) : (
                <ProductImage
                  product={product}
                  className="relative z-10 aspect-square w-full max-w-[15rem] object-contain sm:max-w-[18rem] lg:max-w-full"
                />
              )}
            </div>
          </div>

          <div className="mt-4 flex min-w-0 flex-col gap-3 sm:mt-6 lg:mt-0">
            <div className="overflow-hidden rounded-[1.25rem] border border-stone-200/80 bg-white p-5 sm:rounded-[1.75rem] sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/catalog/${product.category.slug}`}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
                >
                  {product.category.name}
                </Link>
                {product.brand && (
                  <span className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-500">
                    {product.brand}
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-jost text-2xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-3xl">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-[15px]">
                  {product.tagline}
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50/80 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  {product.price != null ? (
                    <div>
                      <p className="text-xs text-stone-500">Цена</p>
                      <p className="mt-0.5 text-2xl font-semibold tabular-nums text-stone-900 sm:text-[1.75rem]">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-stone-500">Цена</p>
                      <p className="mt-0.5 text-base font-medium text-stone-700">По запросу</p>
                    </div>
                  )}
                  {product.sizes && (
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-stone-500">Фасовка</p>
                      <p className="mt-0.5 text-sm font-medium text-stone-800">{product.sizes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  to={`/catalog/${product.category.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                >
                  Ещё в категории
                </Link>
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center rounded-full border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  Весь каталог
                </Link>
              </div>
            </div>

            {product.description && (
              <ExpandableSection title="Описание" defaultOpen={!descriptionLong}>
                <p className="text-sm leading-relaxed text-stone-600 sm:text-[15px]">{product.description}</p>
              </ExpandableSection>
            )}

            {product.features.length > 0 && (
              <ExpandableSection
                title="Свойства"
                badge={String(product.features.length)}
                defaultOpen={!featuresLong}
              >
                <ul className="product-feature-list grid gap-2 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="product-feature-item text-sm text-stone-700">
                      {feature}
                    </li>
                  ))}
                </ul>
              </ExpandableSection>
            )}

            {specEntries.length > 0 && (
              <ExpandableSection
                title="Технические характеристики"
                badge={String(specEntries.length)}
                defaultOpen={!specsLong}
              >
                <dl className="product-specs divide-y divide-stone-100 rounded-xl border border-stone-100">
                  {specEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4 sm:px-5 sm:py-3.5"
                    >
                      <dt className="text-xs font-medium text-stone-500 sm:text-sm">{key}</dt>
                      <dd className="text-sm leading-relaxed text-stone-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </ExpandableSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
