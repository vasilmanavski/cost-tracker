import { useLocation, useNavigate } from 'react-router-dom'
import { useCreateExpense } from '../hooks/useExpenses'
import { ReceiptReview } from '../components/receipt/ReceiptReview'
import type { ExtractionResult } from '../types/extraction'
import type { CreateExpenseRequest } from '../types/expense'

export function ReviewExpensePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const createMutation = useCreateExpense()

  const extraction = (location.state as { extraction?: ExtractionResult })?.extraction

  if (!extraction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No extraction data to review.</p>
        <button
          onClick={() => navigate('/expenses/upload')}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Upload a receipt
        </button>
      </div>
    )
  }

  const handleSubmit = (data: CreateExpenseRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate('/expenses'),
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Extracted Data</h2>
      <ReceiptReview
        extraction={extraction}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
      {createMutation.isError && (
        <p className="text-red-500 text-sm mt-3">
          Failed to save expense. Please check the form and try again.
        </p>
      )}
    </div>
  )
}
