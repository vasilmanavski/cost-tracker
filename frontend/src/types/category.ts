export interface CategorySummary {
  category: string
  displayName: string
  total: number
  count: number
}

export interface DashboardSummary {
  totalAllTime: number
  totalThisMonth: number
  byCategory: CategorySummary[]
}
