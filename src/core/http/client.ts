import type { ApiEnvelope, ApiRequestOptions } from '@/core/types/api'
import { ApiError } from '@/core/types/api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1'

type HttpHooks = {
  getAccessToken?: () => string | null
  onUnauthorized?: () => void
}

let hooks: HttpHooks = {}

export function configureHttpClient(nextHooks: HttpHooks) {
  hooks = nextHooks
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path

  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath.startsWith('/api/')) return normalizedPath

  return `${normalizedBase}${normalizedPath}`
}

function toQueryString(query?: ApiRequestOptions['query']): string {
  if (!query) return ''

  const params = new URLSearchParams()

  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined || raw === null || raw === '') continue
    params.set(key, String(raw))
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(value && typeof value === 'object' && 'success' in value)
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const headers = new Headers(options.headers)

  const accessToken = options.skipAuth ? null : hooks.getAccessToken?.()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let body: BodyInit | null | undefined

  if (options.body !== undefined) {
    if (
      options.body === null ||
      options.body instanceof FormData ||
      options.body instanceof URLSearchParams ||
      typeof options.body === 'string'
    ) {
      body = options.body
    } else {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(options.body)
    }
  }

  const response = await fetch(`${resolveUrl(path)}${toQueryString(options.query)}`, {
    method,
    headers,
    body,
  })

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    const message =
      isApiEnvelope<unknown>(payload) && payload.message
        ? payload.message
        : `Erro HTTP ${response.status}`

    const details = isApiEnvelope<unknown>(payload) ? payload.errors : payload

    if (response.status === 401) hooks.onUnauthorized?.()

    throw new ApiError(message, response.status, details)
  }

  if (isApiEnvelope<T>(payload)) {
    if (!payload.success) {
      throw new ApiError(payload.message || 'Falha inesperada da API', 500, payload.errors)
    }

    return payload.data
  }

  return payload as T
}

export const apiClient = {
  get<T>(path: string, query?: ApiRequestOptions['query']) {
    return apiRequest<T>(path, { query })
  },

  post<T>(path: string, body?: ApiRequestOptions['body']) {
    return apiRequest<T>(path, { method: 'POST', body })
  },

  patch<T>(path: string, body?: ApiRequestOptions['body']) {
    return apiRequest<T>(path, { method: 'PATCH', body })
  },

  put<T>(path: string, body?: ApiRequestOptions['body']) {
    return apiRequest<T>(path, { method: 'PUT', body })
  },

  delete<T>(path: string) {
    return apiRequest<T>(path, { method: 'DELETE' })
  },
}
