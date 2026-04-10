import { useCallback, useState } from 'react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface ReceiptUploadProps {
  onFileSelected: (file: File) => void
  isUploading: boolean
}

export function ReceiptUpload({ onFileSelected, isUploading }: ReceiptUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setFileError(null)
    if (!file.type.startsWith('image/')) {
      setFileError('Please select an image file (JPEG, PNG, or WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large. Maximum size is 10 MB.')
      return
    }
    // Revoke previous URL to avoid memory leak
    if (preview) URL.revokeObjectURL(preview)
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }, [preview])

  const clearSelection = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setSelectedFile(null)
    setFileError(null)
  }, [preview])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : fileError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Receipt preview" className="max-h-64 mx-auto rounded" />
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Choose different image
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Drop receipt image here</p>
            <p className="text-sm text-gray-400 mt-1">or click to browse (JPEG, PNG, WebP — max 10 MB)</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {fileError && (
        <p className="text-sm text-red-600">{fileError}</p>
      )}

      {selectedFile && (
        <button
          onClick={() => onFileSelected(selectedFile)}
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {isUploading ? 'Extracting data from receipt...' : 'Extract Receipt Data'}
        </button>
      )}
    </div>
  )
}
