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

const inputStyles =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

export function ExpenseForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Save Expense' }: ExpenseFormProps) {
  const navigate = useNavigate()
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories()

  const formDefaults: Partial<CreateExpenseRequest> = {
    merchant: '',
    description: '',
    amount: undefined,
    currency: 'MKD',
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
    sourceType: 'MANUAL',
    notes: '',
    ...defaultValues,
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExpenseRequest>({
    defaultValues: formDefaults,
  })

  useEffect(() => {
    if (categories && categories.length > 0) {
      reset(formDefaults)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">

      {/* ── Amount hero ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 mb-3">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Amount
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              autoFocus
              {...register('amount', {
                required: 'Enter an amount',
                valueAsNumber: true,
                min: { value: 0.01, message: 'Must be greater than 0' },
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 placeholder:font-normal"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1.5">{errors.amount.message}</p>
            )}
          </div>
          <select
            {...register('currency')}
            className="border border-gray-300 rounded-lg px-2.5 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MKD">MKD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      {/* ── Details card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-4 mb-3">

        {/* Category + Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              {...register('category', { required: 'Pick a category' })}
              disabled={categoriesLoading}
              className={`${inputStyles} disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="">
                {categoriesLoading ? 'Loading...' : categoriesError ? 'Failed to load' : 'Select category'}
              </option>
              {categories?.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            {categoriesError && <p className="text-red-500 text-xs mt-1">Could not load categories.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              {...register('expenseDate', { required: 'Date is required' })}
              className={inputStyles}
            />
            {errors.expenseDate && <p className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</p>}
          </div>
        </div>

        {/* Merchant */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Merchant <span className="text-red-400">*</span>
          </label>
          <input
            {...register('merchant', { required: 'Merchant is required' })}
            className={inputStyles}
            placeholder="e.g. Vero, Tinex, Bolt"
          />
          {errors.merchant && <p className="text-red-500 text-xs mt-1">{errors.merchant.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <input
            {...register('description', { required: 'Description is required' })}
            className={inputStyles}
            placeholder="What was this for?"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>
      </div>

      {/* ── Optional section ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 mb-5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
          Notes <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          {...register('notes')}
          rows={2}
          className={inputStyles}
          placeholder="Any extra details..."
        />
      </div>

      {/* Hidden fields */}
      <input type="hidden" {...register('sourceType')} />

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-600 text-white py-2.5 px-8 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto py-2.5 px-6 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors text-center"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
