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
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: BodyInit | object | null
  headers?: HeadersInit
  query?: Record<string, string | number | boolean | null | undefined>
  skipAuth?: boolean
}
