import api from './client'
import type { AuthResponse, RegisterRequest, LoginRequest } from '../types/auth'

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/register', data)
  return res
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/login', data)
  return res
}

export async function googleLogin(credential: string): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/google', { credential })
  return res
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data: res } = await api.post('/auth/verify-email', { token })
  return res
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const { data: res } = await api.post('/auth/resend-verification', { email })
  return res
}
