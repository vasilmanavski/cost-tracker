import { formatCurrency } from '../../utils/formatCurrency'
import type { DashboardSummary } from '../../types/category'

interface SummaryCardsProps {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm text-gray-500">Total (All Time)</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {formatCurrency(summary.totalAllTime)}
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm text-gray-500">This Month</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {formatCurrency(summary.totalThisMonth)}
        </p>
      </div>
    </div>
  )
}
