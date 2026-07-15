import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../mock/catalog-data'
import type { Category, Product, ProductList } from './types'

function normRu(text: string) {
  return text.toLocaleLowerCase('ru-RU')
}

function matchesSearch(product: Product, search: string) {
  const term = normRu(search.trim())
  if (!term) return true
  const haystack = normRu([product.name, product.tagline, product.description, product.brand].join(' '))
  return haystack.includes(term)
}

export function mockGetCategories(): Category[] {
  return MOCK_CATEGORIES.map(({ productCount, ...category }) => ({
    ...category,
    productCount,
  }))
}

export function mockGetBrands(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
}

export function mockGetProducts(params: Record<string, string | number | undefined>): ProductList {
  const category = params.category ? String(params.category) : ''
  const brand = params.brand ? String(params.brand) : ''
  const search = params.search ? String(params.search) : ''
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = Math.min(60, Number(params.perPage) || 24)

  let items = MOCK_PRODUCTS.filter((product) => {
    if (category && product.category.slug !== category) return false
    if (brand && product.brand !== brand) return false
    if (!matchesSearch(product, search)) return false
    return true
  })

  items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  const total = items.length
  const totalPages = Math.ceil(total / perPage) || 1
  const safePage = Math.min(page, totalPages)
  const offset = (safePage - 1) * perPage

  return {
    items: items.slice(offset, offset + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  }
}

export function mockGetProduct(slug: string): Product | null {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null
}
