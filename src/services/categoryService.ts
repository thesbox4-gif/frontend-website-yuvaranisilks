import { api } from '@/lib/api'
import type { Category } from '@/types'
import { MOCK_CATEGORIES } from '@/data/mock/categories'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      return await api.get<Category[]>('/api/categories')
    } catch {
      return MOCK_CATEGORIES
    }
  },

  /** Root categories only (no parent). */
  async getRoots(): Promise<Category[]> {
    const all = await this.getAll()
    return all.filter((c) => !c.parent_id).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
  },

  /** Subcategories of a given parent id. */
  async getChildren(parentId: string): Promise<Category[]> {
    const all = await this.getAll()
    return all.filter((c) => c.parent_id === parentId)
  },

  async getBySlug(slug: string): Promise<Category | null> {
    try {
      return await api.get<Category>(`/api/categories/${slug}`)
    } catch {
      return null
    }
  },

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async create(data: Omit<Category, 'id'>, token: string): Promise<Category> {
    return api.post<Category>('/api/categories', data, token)
  },

  async update(id: string, data: Partial<Category>, token: string): Promise<Category> {
    return api.patch<Category>(`/api/categories/${id}`, data, token)
  },

  async remove(id: string, token: string): Promise<void> {
    return api.delete(`/api/categories/${id}`, token)
  },
}
