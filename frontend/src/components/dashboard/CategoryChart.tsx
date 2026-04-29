import { formatCurrency } from '../../utils/formatCurrency'
import type { CategorySummary } from '../../types/category'

interface CategoryChartProps {
  categories: CategorySummary[]
}

interface GroupedCategory {
  category: string
  displayName: string
  entries: { currency: string; total: number; count: number }[]
}

function groupByCategory(categories: CategorySummary[]): GroupedCategory[] {
  const map = new Map<string, GroupedCategory>()
  for (const cat of categories) {
    let group = map.get(cat.category)
    if (!group) {
      group = { category: cat.category, displayName: cat.displayName, entries: [] }
      map.set(cat.category, group)
    }
    group.entries.push({ currency: cat.currency, total: cat.total, count: cat.count })
  }
  return Array.from(map.values())
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

  const grouped = groupByCategory(categories)
  // For the bar chart, find the max total across all individual entries
  const maxTotal = Math.max(...categories.map((c) => c.total))

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Spending by Category</h3>
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.category}>
            <div className="text-sm font-medium text-gray-700 mb-1">{group.displayName}</div>
            {group.entries.map((entry) => {
              const totalCount = entry.count
              return (
                <div key={entry.currency} className="mb-1.5">
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-gray-500">
                      {formatCurrency(entry.total, entry.currency)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {totalCount} {totalCount === 1 ? 'expense' : 'expenses'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(entry.total / maxTotal) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
