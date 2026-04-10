import api from './client'
import type { Expense, ExpensePage, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense'

interface ListParams {
  page?: number
  size?: number
  category?: string
  from?: string
  to?: string
}

export async function listExpenses(params: ListParams = {}): Promise<ExpensePage> {
  const { data } = await api.get('/expenses', { params })
  return data
}

export async function getExpense(id: number): Promise<Expense> {
  const { data } = await api.get(`/expenses/${id}`)
  return data
}

export async function createExpense(request: CreateExpenseRequest): Promise<Expense> {
  const { data } = await api.post('/expenses', request)
  return data
}

export async function updateExpense(id: number, request: UpdateExpenseRequest): Promise<Expense> {
  const { data } = await api.put(`/expenses/${id}`, request)
  return data
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`)
}
