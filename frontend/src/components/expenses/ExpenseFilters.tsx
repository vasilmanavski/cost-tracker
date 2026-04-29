import { useCategories } from '../../hooks/useCategories'

interface ExpenseFiltersProps {
  category: string
  from: string
  to: string
  onChange: (filters: { category: string; from: string; to: string }) => void
}

export function ExpenseFilters({ category, from, to, onChange }: ExpenseFiltersProps) {
  const { data: categories } = useCategories()

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end mb-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => onChange({ category: e.target.value, from, to })}
          className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {categories?.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.displayName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ category, from: e.target.value, to })}
          className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onChange({ category, from, to: e.target.value })}
          className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {(category || from || to) && (
        <button
          onClick={() => onChange({ category: '', from: '', to: '' })}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
