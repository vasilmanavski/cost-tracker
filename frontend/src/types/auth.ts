export interface AuthUser {
  id: number
  email: string
  displayName: string | null
  emailVerified: boolean
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface RegisterRequest {
  email: string
  password: string
  displayName?: string
}

export interface LoginRequest {
  email: string
  password: string
}
