import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import type { Product } from '../lib/types'
import { ProductImage } from '../components/ProductImage'
import { ImageLightbox } from '../components/ImageLightbox'
import { Spinner } from '../components/Spinner'
import { NotFoundPage } from './NotFoundPage'

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

  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 ${fetching ? 'content-dimmed' : ''}`}>
      <nav className="mb-6 text-sm text-stone-400">
        <Link to="/" className="transition-colors hover:text-stone-700">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link to="/catalog" className="transition-colors hover:text-stone-700">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/catalog/${product.category.slug}`}
          className="transition-colors hover:text-stone-700"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="rounded-xl border border-stone-200 bg-white lg:grid lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="flex items-center justify-center border-b border-stone-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          {product.image ? (
            <ImageLightbox src={product.image} alt={product.name}>
              <img
                src={product.image}
                alt={product.name}
                className="aspect-square w-full max-w-[14rem] object-contain sm:max-w-xs"
              />
            </ImageLightbox>
          ) : (
            <ProductImage
              product={product}
              className="aspect-square w-full max-w-[14rem] object-contain sm:max-w-xs"
            />
          )}
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-sm text-stone-500">
            <Link
              to={`/catalog/${product.category.slug}`}
              className="transition-colors hover:text-stone-800"
            >
              {product.category.name}
            </Link>
            {product.brand && (
              <>
                <span className="mx-2 text-stone-300">·</span>
                {product.brand}
              </>
            )}
          </p>

          <h1 className="mt-2 text-xl font-medium leading-snug text-stone-900 sm:text-2xl">
            {product.name}
          </h1>
          {product.tagline && (
            <p className="mt-2 text-[15px] text-stone-600">{product.tagline}</p>
          )}

          <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-stone-100 pt-6">
            {product.price != null ? (
              <span className="text-xl font-medium tabular-nums text-stone-900">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
            ) : (
              <span className="text-sm text-stone-500">Цена по запросу</span>
            )}
            {product.sizes && (
              <span className="text-sm text-stone-500">Фасовка: {product.sizes}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-[15px] leading-relaxed text-stone-600">{product.description}</p>
          )}

          {product.features.length > 0 && (
            <ul className="mt-6 space-y-1.5 border-t border-stone-100 pt-6 text-sm text-stone-600">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {specEntries.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-base font-medium text-stone-900">Технические характеристики</h2>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <dl>
              {specEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid border-b border-stone-100 last:border-b-0 sm:grid-cols-[minmax(0,13rem)_1fr]"
                >
                  <dt className="px-5 py-3 text-sm text-stone-500">{key}</dt>
                  <dd className="border-t border-stone-100 px-5 py-3 text-sm text-stone-800 sm:border-t-0 sm:border-l">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </div>
  )
}
