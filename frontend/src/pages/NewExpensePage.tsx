import { useNavigate } from 'react-router-dom'
import { useCreateExpense } from '../hooks/useExpenses'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import type { CreateExpenseRequest } from '../types/expense'

export function NewExpensePage() {
  const navigate = useNavigate()
  const createMutation = useCreateExpense()

  const handleSubmit = (data: CreateExpenseRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate('/expenses'),
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add Expense</h2>

      {createMutation.isError && (
        <div className="mb-4 max-w-lg">
          <ErrorAlert message="Failed to create expense. Please check the form and try again." />
        </div>
      )}

      <ExpenseForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Add Expense"
      />
    </div>
  )
}
