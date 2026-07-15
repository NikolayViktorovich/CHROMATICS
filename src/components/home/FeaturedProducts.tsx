import { Link } from 'react-router-dom'
import type { Product } from '../../lib/types'
import { ProductImage } from '../ProductImage'

export function FeaturedProducts({
  products,
  loading,
}: {
  products: Product[]
  loading: boolean
}) {
  if (loading && products.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="home-product-skeleton rounded-2xl bg-white p-4" aria-hidden>
            <div className="aspect-square rounded-xl bg-stone-100" />
            <div className="mt-4 h-3 w-16 rounded bg-stone-100" />
            <div className="mt-2 h-4 w-full rounded bg-stone-100" />
            <div className="mt-3 h-4 w-20 rounded bg-stone-100" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product, index) => (
        <Link
          key={product.id}
          to={`/product/${product.slug}`}
          className="home-product-card group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-shadow duration-300 hover:shadow-[0_28px_56px_-28px_rgba(28,25,23,0.35)]"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="home-product-image-wrap relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#fafaf9,#f5f5f4)]">
            <ProductImage
              product={product}
              className="h-full w-full object-contain p-5"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-xs text-stone-400">{product.category.name}</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-stone-900 sm:text-[0.95rem]">
              {product.name}
            </h3>
            {product.tagline && (
              <p className="mt-1 line-clamp-1 text-xs text-stone-500">{product.tagline}</p>
            )}
            <div className="mt-4 flex items-end justify-between gap-2">
              {product.price != null ? (
                <span className="text-base font-semibold tabular-nums text-stone-900">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
              ) : (
                <span className="text-sm text-stone-500">По запросу</span>
              )}
              {product.sizes && (
                <span className="text-xs text-stone-400">{product.sizes}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
