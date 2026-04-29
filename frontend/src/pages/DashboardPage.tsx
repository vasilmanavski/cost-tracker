import { Link } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { useExpenses } from '../hooks/useExpenses'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { CategoryChart } from '../components/dashboard/CategoryChart'
import { Spinner } from '../components/ui/Spinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { PlusCircleIcon, CameraIcon } from '@heroicons/react/24/outline'

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useDashboard()
  const { data: expensesPage, isLoading: expensesLoading, isError: expensesError, refetch: refetchExpenses } = useExpenses({ page: 0, size: 5 })

  const isLoading = summaryLoading || expensesLoading
  const isError = summaryError || expensesError

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <div className="flex gap-2">
          <Link
            to="/expenses/new"
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircleIcon className="h-4 w-4" />
            Add Expense
          </Link>
          <Link
            to="/expenses/upload"
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <CameraIcon className="h-4 w-4" />
            Scan Receipt
          </Link>
        </div>
      </div>

      {isLoading && <Spinner />}

      {isError && !isLoading && (
        <ErrorAlert
          message="Failed to load dashboard data."
          onRetry={() => { refetchSummary(); refetchExpenses() }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {summary && <SummaryCards summary={summary} />}
          {summary && <CategoryChart categories={summary.byCategory} />}

          {/* Recent expenses */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Recent Expenses</h3>
              <Link to="/expenses" className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            {(!expensesPage || expensesPage.content.length === 0) ? (
              <p className="text-gray-400 text-sm">No expenses yet. Add one to get started!</p>
            ) : (
              <div className="space-y-2">
                {expensesPage.content.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{expense.merchant}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatDate(expense.expenseDate)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
