import { Link } from 'react-router-dom'
import type { Expense } from '../../types/expense'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: number) => void
  deletingId?: number
}

const categoryColors: Record<string, string> = {
  groceries: 'bg-green-100 text-green-700',
  restaurants: 'bg-orange-100 text-orange-700',
  coffee: 'bg-amber-100 text-amber-700',
  transport: 'bg-blue-100 text-blue-700',
  bills: 'bg-red-100 text-red-700',
  shopping: 'bg-purple-100 text-purple-700',
  health: 'bg-pink-100 text-pink-700',
  entertainment: 'bg-indigo-100 text-indigo-700',
  travel: 'bg-cyan-100 text-cyan-700',
  subscriptions: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
}

export function ExpenseList({ expenses, onDelete, deletingId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No expenses found</p>
        <p className="text-sm mt-1">Add your first expense to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Merchant</th>
            <th className="py-2 pr-4 font-medium">Description</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium text-right">Amount</th>
            <th className="py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const isDeleting = deletingId === expense.id
            return (
              <tr
                key={expense.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${isDeleting ? 'opacity-50' : ''}`}
              >
                <td className="py-2.5 pr-4 text-gray-600">{formatDate(expense.expenseDate)}</td>
                <td className="py-2.5 pr-4 font-medium text-gray-900">{expense.merchant}</td>
                <td className="py-2.5 pr-4 text-gray-600 max-w-xs truncate">{expense.description}</td>
                <td className="py-2.5 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] || categoryColors.other}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right font-medium text-gray-900">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                      aria-label={`Edit ${expense.merchant}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this expense?')) onDelete(expense.id)
                      }}
                      disabled={isDeleting}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete ${expense.merchant}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
