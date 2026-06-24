import type { UploadResponse } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const uploadService = {
  async uploadImage(file: File, token: string): Promise<UploadResponse> {
    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${BASE}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error ?? 'Upload failed')
    }
    return res.json() as Promise<UploadResponse>
  },

  async uploadMultiple(files: File[], token: string): Promise<UploadResponse[]> {
    return Promise.all(files.map((f) => this.uploadImage(f, token)))
  },
}
