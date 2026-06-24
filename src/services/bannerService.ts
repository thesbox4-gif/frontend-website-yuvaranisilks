import { api } from '@/lib/api'
import type { Banner } from '@/types'
import { MOCK_BANNERS } from '@/data/mock/banners'

export const bannerService = {
  /** Fetch active hero banners. Falls back to mock data when the backend isn't ready. */
  async getActive(): Promise<Banner[]> {
    try {
      const data = await api.get<Banner[]>('/api/banners?active=true')
      return Array.isArray(data) && data.length > 0 ? data : MOCK_BANNERS
    } catch {
      return MOCK_BANNERS
    }
  },

  async getAll(token: string): Promise<Banner[]> {
    return api.get<Banner[]>('/api/banners', token)
  },

  async create(data: Omit<Banner, 'id'>, token: string): Promise<Banner> {
    return api.post<Banner>('/api/banners', data, token)
  },

  async update(id: string, data: Partial<Banner>, token: string): Promise<Banner> {
    return api.patch<Banner>(`/api/banners/${id}`, data, token)
  },

  async remove(id: string, token: string): Promise<void> {
    return api.delete(`/api/banners/${id}`, token)
  },

  async reorder(ids: string[], token: string): Promise<void> {
    return api.patch('/api/banners/reorder', { ids }, token)
  },
}
