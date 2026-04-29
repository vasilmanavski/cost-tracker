import { formatCurrency } from '../../utils/formatCurrency'
import type { DashboardSummary } from '../../types/category'

interface SummaryCardsProps {
  summary: DashboardSummary
}

function CurrencyAmounts({ totals }: { totals: { currency: string; amount: number }[] }) {
  if (totals.length === 0) {
    return <p className="text-2xl font-semibold text-gray-900 mt-1">{formatCurrency(0)}</p>
  }
  return (
    <div className="mt-1 space-y-0.5">
      {totals.map((t) => (
        <p key={t.currency} className="text-2xl font-semibold text-gray-900">
          {formatCurrency(t.amount, t.currency)}
        </p>
      ))}
    </div>
  )
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm text-gray-500">Total (All Time)</p>
        <CurrencyAmounts totals={summary.totalAllTime} />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm text-gray-500">This Month</p>
        <CurrencyAmounts totals={summary.totalThisMonth} />
      </div>
    </div>
  )
}
