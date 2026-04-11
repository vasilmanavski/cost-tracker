export function formatCurrency(amount: number, currency: string = 'MKD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}
