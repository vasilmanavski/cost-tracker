import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses, useDeleteExpense } from '../hooks/useExpenses'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseFilters } from '../components/expenses/ExpenseFilters'
import { Spinner } from '../components/ui/Spinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

export function ExpenseListPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({ category: '', from: '', to: '' })

  const { data, isLoading, isError, refetch } = useExpenses({
    page,
    size: 20,
    category: filters.category || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  })

  const deleteMutation = useDeleteExpense()

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Expenses</h2>
        <Link
          to="/expenses/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircleIcon className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      <ExpenseFilters
        category={filters.category}
        from={filters.from}
        to={filters.to}
        onChange={(f) => { setFilters(f); setPage(0) }}
      />

      {deleteMutation.isError && (
        <div className="mb-3">
          <ErrorAlert message="Failed to delete expense. Please try again." />
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorAlert message="Failed to load expenses." onRetry={() => refetch()} />
      ) : (
        <>
          <ExpenseList
            expenses={data?.content ?? []}
            onDelete={handleDelete}
            deletingId={deleteMutation.isPending ? (deleteMutation.variables as number) : undefined}
          />

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">
                Page {data.number + 1} of {data.totalPages} ({data.totalElements} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
