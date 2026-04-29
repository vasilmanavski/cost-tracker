import { useNavigate, useParams } from 'react-router-dom'
import { useExpense, useUpdateExpense, useDeleteExpense } from '../hooks/useExpenses'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { Spinner } from '../components/ui/Spinner'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import type { CreateExpenseRequest } from '../types/expense'

export function EditExpensePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: expense, isLoading, isError, refetch } = useExpense(Number(id))
  const updateMutation = useUpdateExpense()
  const deleteMutation = useDeleteExpense()

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <ErrorAlert
        message="Failed to load expense. It may have been deleted or a network error occurred."
        onRetry={() => refetch()}
      />
    )
  }

  if (!expense) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Expense not found</p>
        <button
          onClick={() => navigate('/expenses')}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Back to expenses
        </button>
      </div>
    )
  }

  const handleSubmit = (data: CreateExpenseRequest) => {
    updateMutation.mutate(
      { id: expense.id, data: { ...data } },
      { onSuccess: () => navigate('/expenses') }
    )
  }

  const handleDelete = () => {
    if (confirm('Delete this expense? This cannot be undone.')) {
      deleteMutation.mutate(expense.id, {
        onSuccess: () => navigate('/expenses'),
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 max-w-md">
        <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="text-sm text-red-500 hover:text-red-700 font-medium disabled:text-red-300 transition-colors"
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {updateMutation.isError && (
        <div className="mb-4 max-w-md">
          <ErrorAlert message="Failed to update expense. Please check the form and try again." />
        </div>
      )}

      {deleteMutation.isError && (
        <div className="mb-4 max-w-md">
          <ErrorAlert message="Failed to delete expense. Please try again." />
        </div>
      )}

      <ExpenseForm
        defaultValues={{
          merchant: expense.merchant,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          expenseDate: expense.expenseDate,
          sourceType: expense.sourceType,
          notes: expense.notes ?? '',
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Update Expense"
      />

      {expense.receiptImagePath && (
        <div className="mt-6 max-w-md">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Receipt Image</h3>
          <img
            src={`/api/receipts/images/${expense.receiptImagePath.replace('receipts/', '')}`}
            alt="Receipt"
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  )
}
