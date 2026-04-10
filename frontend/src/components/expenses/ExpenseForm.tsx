import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import type { CreateExpenseRequest } from '../../types/expense'

interface ExpenseFormProps {
  defaultValues?: Partial<CreateExpenseRequest>
  onSubmit: (data: CreateExpenseRequest) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function ExpenseForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Save Expense' }: ExpenseFormProps) {
  const navigate = useNavigate()
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories()

  const formDefaults: Partial<CreateExpenseRequest> = {
    merchant: '',
    description: '',
    amount: undefined,
    currency: 'USD',
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
    sourceType: 'MANUAL',
    notes: '',
    ...defaultValues,
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExpenseRequest>({
    defaultValues: formDefaults,
  })

  // Re-apply defaults once categories have loaded so the <select> can match the value
  useEffect(() => {
    if (categories && categories.length > 0) {
      reset(formDefaults)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Merchant *</label>
        <input
          {...register('merchant', { required: 'Merchant is required' })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Trader Joe's"
        />
        {errors.merchant && <p className="text-red-500 text-xs mt-1">{errors.merchant.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', {
              required: 'Amount is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Must be > 0' },
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            {...register('currency')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            {...register('category', { required: 'Category is required' })}
            disabled={categoriesLoading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : categoriesError ? 'Failed to load' : 'Select category'}
            </option>
            {categories?.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.displayName}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          {categoriesError && <p className="text-red-500 text-xs mt-1">Could not load categories. Please refresh the page.</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            {...register('expenseDate', { required: 'Date is required' })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.expenseDate && <p className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <input
          {...register('description', { required: 'Description is required' })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Short description of what you bought"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Optional notes"
        />
      </div>

      {/* Hidden fields for source tracking */}
      <input type="hidden" {...register('sourceType')} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
