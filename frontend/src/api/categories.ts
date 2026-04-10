import api from './client'

export interface Category {
  id: number
  name: string
  displayName: string
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}
