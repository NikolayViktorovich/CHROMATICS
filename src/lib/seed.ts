import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed-data'
import type { Category, Product, ProductList } from './types'

export function seedGetCategories(all = false): Category[] {
  if (all) return SEED_CATEGORIES
  return SEED_CATEGORIES.filter((c) => (c.productCount ?? 0) > 0)
}

export function seedGetBrands(): string[] {
  return [...new Set(SEED_PRODUCTS.filter((p) => p.isActive).map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
}

export function seedGetProducts(params: Record<string, string | number | undefined>): ProductList {
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = Math.max(1, Number(params.perPage) || 24)
  const search = String(params.search ?? '')
    .trim()
    .toLowerCase()
  const brand = String(params.brand ?? '')
  const category = String(params.category ?? '')

  let items = SEED_PRODUCTS.filter((p) => p.isActive)

  if (category) items = items.filter((p) => p.category.slug === category)
  if (brand) items = items.filter((p) => p.brand === brand)
  if (search) {
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.tagline.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search),
    )
  }

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: items.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  }
}

export function seedGetProduct(slug: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug && p.isActive)
}
