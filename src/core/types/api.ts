export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface ApiErrorDetails {
  details?: unknown
  method?: string
  path?: string
  timestamp?: string
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
  errors?: ApiErrorDetails
}

export interface ApiRequestOptions {
  method?: HttpMethod
  body?: BodyInit | object | null
  headers?: HeadersInit
  query?: Record<string, string | number | boolean | null | undefined>
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isAuthError(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422
  }

  get isConflict(): boolean {
    return this.status === 409
  }
}
