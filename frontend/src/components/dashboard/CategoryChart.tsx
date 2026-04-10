import { formatCurrency } from '../../utils/formatCurrency'
import type { CategorySummary } from '../../types/category'

interface CategoryChartProps {
  categories: CategorySummary[]
}

export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Spending by Category</h3>
        <p className="text-gray-400 text-sm">No expenses this month.</p>
      </div>
    )
  }

  const maxTotal = Math.max(...categories.map((c) => c.total))

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Spending by Category</h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{cat.displayName}</span>
              <span className="text-gray-500">
                {formatCurrency(cat.total)} ({cat.count} {cat.count === 1 ? 'expense' : 'expenses'})
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(cat.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
