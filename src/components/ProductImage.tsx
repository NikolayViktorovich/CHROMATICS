import type { Product } from '../lib/types'

export function ProductImage({
  product,
  className,
}: {
  product: Pick<Product, 'image' | 'name'>
  className?: string
}) {
  if (product.image) {
    return <img src={product.image} alt={product.name} loading="lazy" className={className} />
  }
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <svg viewBox="0 0 64 64" className="h-2/3 w-2/3 max-h-32 text-neutral-200" fill="currentColor" aria-hidden>
        <path d="M14 24h36v28a6 6 0 01-6 6H20a6 6 0 01-6-6V24z" />
        <path
          d="M12 24c0-11 9-18 20-18s20 7 20 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="22" y="34" width="20" height="4" rx="2" fill="#facc15" />
      </svg>
    </div>
  )
}
