import {
  seedGetBrands,
  seedGetCategories,
  seedGetProduct,
  seedGetProducts,
} from './seed'
import type { Category, Product, ProductInput } from './types'

export type AdminSession = {
  id: string
  ip: string
  userAgent: string
  createdAt: string
  lastSeenAt: string
  current: boolean
}

const TOKEN_KEY = 'admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('Сервер недоступен. Запустите API (порт 4000).', 0)
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Ошибка запроса (${res.status})`, res.status)
  }
  return data as T
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: number; username: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getMe: () => request<{ user: { id: number; username: string } }>('/api/auth/me'),

  getSessions: () => request<{ sessions: AdminSession[] }>('/api/auth/sessions'),

  revokeSession: (id: string) =>
    request<void>(`/api/auth/sessions/${id}`, { method: 'DELETE' }),

  revokeOtherSessions: () =>
    request<{ revoked: number }>('/api/auth/sessions/revoke-others', { method: 'POST' }),

  revokeAllSessions: () =>
    request<{ revoked: boolean; token: string; user: { id: number; username: string } }>(
      '/api/auth/sessions/revoke-all',
      { method: 'POST' },
    ),

  getCategories: (all = false) => Promise.resolve(seedGetCategories(all)),
  createCategory: (data: Partial<Category>) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<Category>) =>
    request<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  bulkDeleteCategories: (payload: { ids?: number[]; all?: boolean; force?: boolean }) =>
    request<{ deleted: number; productsDeleted: number; skipped: number }>(
      '/api/categories/bulk-delete',
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  getProducts: (params: Record<string, string | number | undefined>) =>
    Promise.resolve(seedGetProducts(params)),
  getProduct: (slug: string) => {
    const product = seedGetProduct(slug)
    if (!product) return Promise.reject(new ApiError('Товар не найден', 404))
    return Promise.resolve(product)
  },
  getBrands: () => Promise.resolve(seedGetBrands()),
  createProduct: (data: ProductInput) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: ProductInput) =>
    request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<void>(`/api/products/${id}`, { method: 'DELETE' }),
  bulkDeleteProducts: (payload: { ids?: number[]; all?: boolean }) =>
    request<{ deleted: number }>('/api/products/bulk-delete', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string }>('/api/uploads', { method: 'POST', body: form })
  },
}
