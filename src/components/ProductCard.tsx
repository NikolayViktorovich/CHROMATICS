import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { ProductImage } from './ProductImage'

export function ProductCard({
  product,
  hideBrand = false,
}: {
  product: Product
  hideBrand?: boolean
}) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="catalog-product-card flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(28,25,23,0.28)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#fafaf9,#f5f5f4)]">
        <ProductImage
          product={product}
          className="h-full w-full object-contain p-4 sm:p-5"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="line-clamp-1 text-xs text-stone-400">
          {product.category.name}
          {product.brand && !hideBrand && (
            <>
              <span className="mx-1 text-stone-300">·</span>
              {product.brand}
            </>
          )}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-stone-900 sm:text-[0.95rem]">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="mt-1 hidden line-clamp-2 text-sm text-stone-500 sm:block">{product.tagline}</p>
        )}
        <div className="mt-auto flex flex-col gap-0.5 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2 sm:pt-4">
          {product.price != null ? (
            <span className="text-base font-semibold tabular-nums text-stone-900">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
          ) : (
            <span className="text-sm text-stone-500">По запросу</span>
          )}
          {product.sizes && (
            <span className="line-clamp-1 text-xs text-stone-400">{product.sizes}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
