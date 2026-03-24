export function formatDate(value?: string | Date | null): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('pt-BR')
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`
}

export function formatMoney(value: unknown, currency = 'BRL'): string {
  const numeric = Number(value ?? 0)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(numeric) ? 0 : numeric)
}

export function toLabelCase(value: string): string {
  return value
    .split(/[_-]/g)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ')
}

export function getNestedValue(source: unknown, path: string): unknown {
  if (!source || typeof source !== 'object') return undefined
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[segment]
  }, source)
}
