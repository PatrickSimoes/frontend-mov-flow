import type { ApiEnvelope, ApiRequestOptions } from '@/types/api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1'

export class ApiError extends Error {
  constructor (
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type HttpHooks = {
  getAccessToken?: () => string | null
  onUnauthorized?: () => void
}

let hooks: HttpHooks = {}

export function configureHttpClient (nextHooks: HttpHooks) {
  hooks = nextHooks
}

function isApiEnvelope<T> (value: unknown): value is ApiEnvelope<T> {
  return typeof value === 'object' && value !== null && 'success' in value
}

function resolveUrl (path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath.startsWith('/api/')) {
    return normalizedPath
  }

  return `${normalizedBase}${normalizedPath}`
}

function toQueryString (query: ApiRequestOptions['query']): string {
  if (!query) {
    return ''
  }

  const params = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) {
      continue
    }
    params.set(key, String(rawValue))
  }

  const result = params.toString()
  return result ? `?${result}` : ''
}

async function parseResponseBody (response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function apiRequest<T> (path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const headers = new Headers(options.headers)
  const accessToken = options.skipAuth ? null : hooks.getAccessToken?.()

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let body: BodyInit | null | undefined = undefined
  if (options.body !== undefined) {
    if (
      options.body === null
      || options.body instanceof FormData
      || options.body instanceof URLSearchParams
      || typeof options.body === 'string'
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
    const message
      = isApiEnvelope<unknown>(payload) && payload.message
        ? payload.message
        : `Erro HTTP ${response.status}`
    const details = isApiEnvelope<unknown>(payload) ? payload.errors : payload

    if (response.status === 401) {
      hooks.onUnauthorized?.()
    }

    throw new ApiError(message, response.status, details)
  }

  if (isApiEnvelope<T>(payload)) {
    if (payload.success) {
      return payload.data
    }

    throw new ApiError(payload.message || 'Falha inesperada ao processar resposta da API', 500)
  }

  return payload as T
}
