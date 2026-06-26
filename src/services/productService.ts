import { api } from '@/lib/api'
import type { Product } from '@/types'
import { NEW_ARRIVALS_DAYS } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/data/mock/products'

function applyMockFilters(filters: ProductFilters): ProductsResponse {
  let list = [...MOCK_PRODUCTS]

  if (filters.published !== false) list = list.filter((p) => p.published)
  if (filters.type) list = list.filter((p) => p.type === filters.type)
  if (filters.category) list = list.filter((p) => p.category?.id === filters.category || p.category?.slug === filters.category)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }
  if (filters.occasion) list = list.filter((p) => p.occasion?.toLowerCase() === filters.occasion?.toLowerCase())
  if (filters.minPrice != null) list = list.filter((p) => p.base_price >= filters.minPrice!)
  if (filters.maxPrice != null) list = list.filter((p) => p.base_price <= filters.maxPrice!)

  if (filters.sort === 'price_asc') list.sort((a, b) => a.base_price - b.base_price)
  else if (filters.sort === 'price_desc') list.sort((a, b) => b.base_price - a.base_price)
  else if (filters.sort === 'popular' || filters.sort === 'best_seller')
    list.sort((a, b) => (b.variants?.[0]?.sold_count ?? 0) - (a.variants?.[0]?.sold_count ?? 0))
  else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const total = list.length
  const data = list.slice((page - 1) * limit, page * limit)
  return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
}

export interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  totalPages: number
}

export interface ProductFilters {
  type?: string
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
  published?: boolean
  occasion?: string
  fabric?: string
  material?: string
}

export const productService = {
  async getMany(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const q = new URLSearchParams()
    if (filters.type) q.set('type', filters.type)
    if (filters.category) q.set('category', filters.category)
    if (filters.search) q.set('search', filters.search)
    if (filters.minPrice != null) q.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice != null) q.set('maxPrice', String(filters.maxPrice))
    if (filters.sort) q.set('sort', filters.sort)
    q.set('page', String(filters.page ?? 1))
    q.set('limit', String(filters.limit ?? 20))
    if (filters.published != null) q.set('published', String(filters.published))
    if (filters.occasion) q.set('occasion', filters.occasion)
    if (filters.fabric) q.set('fabric', filters.fabric)
    if (filters.material) q.set('material', filters.material)

    try {
      return await api.get<ProductsResponse>(`/api/products?${q.toString()}`)
    } catch {
      return applyMockFilters(filters)
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      return await api.get<Product>(`/api/products/${id}`)
    } catch {
      return null
    }
  },

  /** Fetch newest products within the configured time window.
   *  `days` defaults to NEW_ARRIVALS_DAYS (30). Fetches a larger batch then
   *  filters client-side so every newly added product appears automatically.
   *  Graceful fallback: if nothing falls within the window, returns the most
   *  recently created products so the section is never empty. */
  async getNewArrivals(limit = 8, days = NEW_ARRIVALS_DAYS): Promise<Product[]> {
    const fetchLimit = Math.max(limit * 4, 32)
    const res = await this.getMany({ sort: 'newest', limit: fetchLimit, published: true })
    const all = res.data

    const cutoff = Date.now() - days * 86_400_000
    const inWindow = all.filter(
      (p) => p.created_at && new Date(p.created_at).getTime() >= cutoff
    )

    return (inWindow.length > 0 ? inWindow : all).slice(0, limit)
  },

  /** Fetch trending products (most sold). */
  async getTrending(limit = 8): Promise<Product[]> {
    const res = await this.getMany({ sort: 'popular', limit, published: true })
    return res.data
  },

  /** Fetch best-selling products. */
  async getBestSellers(limit = 8): Promise<Product[]> {
    const res = await this.getMany({ sort: 'best_seller', limit, published: true })
    return res.data
  },

  /** Fetch newest products of a specific type (saree or jewellery). */
  async getFeaturedByType(type: 'saree' | 'jewellery', limit = 8): Promise<Product[]> {
    const res = await this.getMany({ type, limit, published: true, sort: 'newest' })
    return res.data
  },

  /** Fetch products tagged with a given occasion (e.g. "wedding"). */
  async getByOccasion(occasion: string, limit = 8): Promise<Product[]> {
    const res = await this.getMany({ occasion, limit, published: true })
    return res.data
  },

  /** Fetch specific products by IDs (admin-curated lists). */
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return []
    try {
      const res = await api.get<ProductsResponse>(`/api/products?ids=${ids.join(',')}`)
      return res.data ?? []
    } catch {
      return []
    }
  },

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async create(data: Partial<Product>, token: string): Promise<Product> {
    return api.post<Product>('/api/products', data, token)
  },

  async update(id: string, data: Partial<Product>, token: string): Promise<Product> {
    return api.patch<Product>(`/api/products/${id}`, data, token)
  },

  async remove(id: string, token: string): Promise<void> {
    return api.delete(`/api/products/${id}`, token)
  },

  async publish(id: string, published: boolean, token: string): Promise<Product> {
    return api.patch<Product>(`/api/products/${id}`, { published }, token)
  },
}
