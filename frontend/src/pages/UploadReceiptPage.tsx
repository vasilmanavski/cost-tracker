import {
  CameraIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

const futureSteps = [
  {
    icon: CameraIcon,
    title: 'Upload receipt',
    description: 'Snap a photo or drag & drop an image of your receipt',
  },
  {
    icon: DocumentTextIcon,
    title: 'Extract details',
    description: 'AI reads the merchant, amount, date, and line items automatically',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Review & save',
    description: 'Verify the extracted data and save it as an expense in one click',
  },
]

export function UploadReceiptPage() {
  return (
    <div className="max-w-lg">
      {/* Header with badge */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">Scan Receipt</h2>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          Coming Soon
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Receipt scanning and smart extraction are currently under development.
        This feature will be available in an upcoming release.
      </p>

      {/* Disabled dropzone */}
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center select-none">
        <CameraIcon className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-400">
          Drag & drop a receipt image
        </p>
        <p className="mt-1 text-xs text-gray-300">
          PNG, JPG, or PDF up to 10 MB
        </p>
        <button
          disabled
          className="mt-5 inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          Upload & Scan
        </button>
      </div>

      {/* Future functionality preview */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">How it will work</h3>
        <div className="space-y-4">
          {futureSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100">
                <step.icon className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{step.title}</p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
