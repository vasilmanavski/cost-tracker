import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../api/expenses'
import type { CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

interface ListParams {
  page?: number
  size?: number
  category?: string
  from?: string
  to?: string
}

export function useExpenses(params: ListParams = {}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => listExpenses(params),
  })
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseRequest }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expense'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
