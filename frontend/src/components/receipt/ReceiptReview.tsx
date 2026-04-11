import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCategories } from '../../hooks/useCategories'
import type { ExtractionResult, LineItem } from '../../types/extraction'
import type { CreateExpenseRequest } from '../../types/expense'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ReceiptReviewProps {
  extraction: ExtractionResult
  onSubmit: (data: CreateExpenseRequest) => void
  isSubmitting: boolean
}

function confidenceColor(level: string): string {
  switch (level) {
    case 'LOW': return 'ring-2 ring-yellow-400 bg-yellow-50'
    case 'MEDIUM': return 'ring-1 ring-yellow-300'
    default: return ''
  }
}

function ConfidenceBadge({ level }: { level: string }) {
  if (level === 'HIGH') return null
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
      level === 'LOW' ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100'
    }`}>
      <ExclamationTriangleIcon className="h-3 w-3" />
      {level} confidence
    </span>
  )
}

export function ReceiptReview({ extraction, onSubmit, isSubmitting }: ReceiptReviewProps) {
  const { data: categories } = useCategories()

  const defaultValues: CreateExpenseRequest = {
    merchant: extraction.merchant ?? '',
    description: extraction.description ?? '',
    amount: extraction.amount ?? undefined as unknown as number,
    currency: extraction.currency ?? 'MKD',
    category: extraction.category ?? '',
    expenseDate: extraction.expenseDate ?? new Date().toISOString().split('T')[0],
    sourceType: 'RECEIPT',
    receiptImagePath: extraction.receiptImagePath,
    lineItemsJson: extraction.lineItems ? JSON.stringify(extraction.lineItems) : null,
    extractionConfidence: extraction.confidence,
    needsReview: extraction.needsReview,
    notes: '',
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExpenseRequest>({
    defaultValues,
  })

  // Re-apply defaults once categories have loaded so the <select> can match
  useEffect(() => {
    if (categories && categories.length > 0) {
      reset(defaultValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  const cd = extraction.confidenceDetails

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Receipt image */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Receipt Image</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={`/api/receipts/images/${extraction.receiptImagePath.replace('receipts/', '')}`}
            alt="Uploaded receipt"
            className="w-full object-contain max-h-[600px]"
          />
        </div>

        {/* Warnings */}
        {extraction.warnings.length > 0 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800 mb-1">Extraction Notes</p>
            {extraction.warnings.map((w, i) => (
              <p key={i} className="text-xs text-yellow-700">{w}</p>
            ))}
          </div>
        )}

        {/* Line items if available */}
        {extraction.lineItems && extraction.lineItems.length > 0 && (
          <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-500">Detected Line Items</p>
              {cd.lineItems && <ConfidenceBadge level={cd.lineItems} />}
            </div>
            <div className="space-y-1">
              {extraction.lineItems.map((item: LineItem, i: number) => (
                <div key={i} className="flex justify-between text-xs text-gray-600">
                  <span>{item.name}{item.quantity && item.quantity > 1 ? ` (x${item.quantity})` : ''}</span>
                  <span>{item.price != null ? `$${item.price.toFixed(2)}` : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Editable form */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Review & Edit Extracted Data
          {extraction.needsReview && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">
              <ExclamationTriangleIcon className="h-3 w-3" />
              Needs review
            </span>
          )}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-medium text-gray-700">Merchant *</label>
              {cd.merchant && <ConfidenceBadge level={cd.merchant} />}
            </div>
            <input
              {...register('merchant', { required: 'Merchant is required' })}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cd.merchant ? confidenceColor(cd.merchant) : ''}`}
            />
            {errors.merchant && <p className="text-red-500 text-xs mt-1">{errors.merchant.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-medium text-gray-700">Amount *</label>
                {cd.amount && <ConfidenceBadge level={cd.amount} />}
              </div>
              <input
                type="number"
                step="0.01"
                {...register('amount', {
                  required: 'Amount is required',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Must be > 0' },
                })}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cd.amount ? confidenceColor(cd.amount) : ''}`}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                {...register('currency')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MKD">MKD</option>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-medium text-gray-700">Date *</label>
                {cd.date && <ConfidenceBadge level={cd.date} />}
              </div>
              <input
                type="date"
                {...register('expenseDate', { required: 'Date is required' })}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cd.date ? confidenceColor(cd.date) : ''}`}
              />
              {errors.expenseDate && <p className="text-red-500 text-xs mt-1">{errors.expenseDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              {...register('description', { required: 'Description is required' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Hidden fields */}
          <input type="hidden" {...register('sourceType')} />
          <input type="hidden" {...register('receiptImagePath')} />
          <input type="hidden" {...register('lineItemsJson')} />
          <input type="hidden" {...register('extractionConfidence')} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
