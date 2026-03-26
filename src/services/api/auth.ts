import type { AuthSessionResponse, LoginPayload, MeResponse, RegisterPayload } from '@/types/auth'
import { apiRequest } from '@/services/http'

export const authApi = {
  login (payload: LoginPayload) {
    return apiRequest<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  },

  register (payload: RegisterPayload) {
    return apiRequest<AuthSessionResponse>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    })
  },

  me () {
    return apiRequest<MeResponse>('/auth/me')
  },
}
