export const CATEGORIES = [
  'groceries',
  'restaurants',
  'coffee',
  'transport',
  'bills',
  'shopping',
  'health',
  'entertainment',
  'travel',
  'subscriptions',
  'other',
] as const

export type CategoryType = typeof CATEGORIES[number]

export interface Expense {
  id: number
  merchant: string
  description: string
  amount: number
  currency: string
  category: CategoryType
  expenseDate: string
  sourceType: 'MANUAL' | 'RECEIPT'
  receiptImagePath: string | null
  lineItemsJson: string | null
  extractionConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | null
  needsReview: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseRequest {
  merchant: string
  description: string
  amount: number
  currency: string
  category: string
  expenseDate: string
  sourceType: 'MANUAL' | 'RECEIPT'
  receiptImagePath?: string | null
  lineItemsJson?: string | null
  extractionConfidence?: string | null
  needsReview?: boolean
  notes?: string | null
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {}

export interface ExpensePage {
  content: Expense[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
  first: boolean
}
