import api from './client'
import type { ExtractionResult } from '../types/extraction'

export async function extractReceipt(file: File): Promise<ExtractionResult> {
  const formData = new FormData()
  formData.append('receipt', file)

  const { data } = await api.post('/receipts/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // extraction can take a while with real API
  })

  return data
}
