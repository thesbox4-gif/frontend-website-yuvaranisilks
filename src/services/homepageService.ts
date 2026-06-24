import { api } from '@/lib/api'
import type { HomepageSettings, AdminStats, Customer } from '@/types'
import { MOCK_HOMEPAGE_SETTINGS } from '@/data/mock/homepage'

export const homepageService = {
  async getSettings(): Promise<HomepageSettings> {
    try {
      const data = await api.get<HomepageSettings>('/api/homepage')
      return data ?? MOCK_HOMEPAGE_SETTINGS
    } catch {
      return MOCK_HOMEPAGE_SETTINGS
    }
  },

  async updateSettings(data: HomepageSettings, token: string): Promise<HomepageSettings> {
    return api.patch<HomepageSettings>('/api/homepage', data, token)
  },
}

export const adminService = {
  async getStats(token: string): Promise<AdminStats> {
    return api.get<AdminStats>('/api/admin/stats', token)
  },

  async getCustomers(token: string, page = 1, limit = 20): Promise<{ data: Customer[]; total: number }> {
    return api.get<{ data: Customer[]; total: number }>(
      `/api/admin/customers?page=${page}&limit=${limit}`,
      token
    )
  },

  async getOrdersAdmin(
    token: string,
    filters: { status?: string; page?: number; limit?: number } = {}
  ) {
    const q = new URLSearchParams()
    if (filters.status) q.set('status', filters.status)
    q.set('page', String(filters.page ?? 1))
    q.set('limit', String(filters.limit ?? 20))
    return api.get(`/api/admin/orders?${q.toString()}`, token)
  },
}
