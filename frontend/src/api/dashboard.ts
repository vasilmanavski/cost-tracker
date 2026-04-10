import api from './client'
import type { DashboardSummary } from '../types/category'

export async function getDashboardSummary(month?: string): Promise<DashboardSummary> {
  const { data } = await api.get('/dashboard/summary', {
    params: month ? { month } : {},
  })
  return data
}
