export interface ExtractionResult {
  merchant: string | null
  expenseDate: string | null
  amount: number | null
  currency: string | null
  category: string | null
  description: string | null
  lineItems: LineItem[] | null
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  confidenceDetails: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'>
  receiptImagePath: string
  needsReview: boolean
  warnings: string[]
}

export interface LineItem {
  name: string
  quantity: number | null
  price: number | null
}
