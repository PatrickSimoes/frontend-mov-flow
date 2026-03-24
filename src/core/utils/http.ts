export function fillPathParams(
  path: string,
  params: Record<string, string | number | undefined | null>,
): string {
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined || value === null) return ''
    return encodeURIComponent(String(value))
  })
}

export function compactQuery(
  query: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}

  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined || raw === null || raw === '') continue

    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      result[key] = raw
    }
  }

  return result
}

export function normalizeListPayload<T>(payload: unknown): { items: T[]; total: number | null } {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      total: null,
    }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    const candidate =
      (Array.isArray(record.items) ? record.items : null) ??
      (Array.isArray(record.data) ? record.data : null) ??
      (Array.isArray(record.results) ? record.results : null)

    if (candidate) {
      const totalCandidate =
        typeof record.total === 'number'
          ? record.total
          : typeof (record.meta as Record<string, unknown> | undefined)?.total === 'number'
            ? ((record.meta as Record<string, unknown>).total as number)
            : null

      return {
        items: candidate as T[],
        total: totalCandidate,
      }
    }
  }

  return {
    items: [],
    total: null,
  }
}
