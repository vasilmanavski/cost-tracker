import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReceiptUpload } from '../components/receipt/ReceiptUpload'
import { extractReceipt } from '../api/receipts'
import type { ExtractionResult } from '../types/extraction'

export function UploadReceiptPage() {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const result: ExtractionResult = await extractReceipt(file)
      // Navigate to review page, passing extraction data via state
      navigate('/expenses/review', { state: { extraction: result } })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Extraction failed'
      setError(`Failed to extract receipt data: ${message}. You can try again or add the expense manually.`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scan Receipt</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload a photo of your receipt. We'll extract the merchant, amount, date, and items.
        You can review and edit everything before saving.
      </p>

      <ReceiptUpload onFileSelected={handleFileSelected} isUploading={isUploading} />

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => navigate('/expenses/new')}
            className="mt-2 text-sm text-red-700 underline hover:text-red-900"
          >
            Enter expense manually instead
          </button>
        </div>
      )}
    </div>
  )
}
