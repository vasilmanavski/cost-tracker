export interface CurrencyTotal {
  currency: string
  amount: number
}

export interface CategorySummary {
  category: string
  displayName: string
  currency: string
  total: number
  count: number
}

export interface DashboardSummary {
  totalAllTime: CurrencyTotal[]
  totalThisMonth: CurrencyTotal[]
  byCategory: CategorySummary[]
}
