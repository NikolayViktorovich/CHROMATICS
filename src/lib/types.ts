export interface Category {
  id: number
  slug: string
  name: string
  description: string
  sortOrder: number
  productCount?: number
}

export interface Product {
  id: number
  slug: string
  brand: string
  name: string
  tagline: string
  description: string
  features: string[]
  specs: Record<string, string>
  sizes: string
  price: number | null
  image: string | null
  isActive: boolean
  category: Pick<Category, 'id' | 'slug' | 'name'>
  createdAt: string
  updatedAt: string
}

export interface ProductList {
  items: Product[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ProductInput {
  categoryId: number
  brand: string
  name: string
  tagline: string
  description: string
  features: string[]
  specs: Record<string, string>
  sizes: string
  price: number | string | null
  image: string | null
  isActive: boolean
}
