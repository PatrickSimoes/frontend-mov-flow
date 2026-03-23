export type ModuleCode = 'logistics' | 'fleet' | 'financial'

export interface AuthUser {
  id: string
  tenantId: string
  email: string
  name: string
  tokenVersion: number
  roles: string[]
  permissions: string[]
}

export interface AuthSessionResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: AuthUser
}

export interface AuthSession {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  expiresAt: number
  user: AuthUser
}

export interface LoginPayload {
  tenantSlug: string
  email: string
  password: string
}

export interface RegisterPayload {
  tenantName: string
  name: string
  email: string
  password: string
}

export interface MeResponse {
  id: string
  name: string
  email: string
  tenantId: string
  tokenVersion: number
  roles: string[]
  permissions: string[]
}
