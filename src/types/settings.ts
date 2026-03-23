export interface TenantSettings {
  id: string
  tenantId: string
  currency: string
  timezone: string
  defaultInterestRate: number
  defaultFineRate: number
  defaultPaymentTermDays: number
  autoGenerateReceivableOnDelivery: boolean
  allowNegativeCashFlow: boolean
  createdAt: string
  updatedAt: string
  version: number
}

export interface TenantSettingsUpdatePayload {
  currency?: string
  timezone?: string
  defaultInterestRate?: number
  defaultFineRate?: number
  defaultPaymentTermDays?: number
  autoGenerateReceivableOnDelivery?: boolean
  allowNegativeCashFlow?: boolean
}

export interface TenantSettingsAuditEntry {
  id: string
  settingsId: string
  changedBy?: string
  beforeData: Record<string, unknown>
  afterData: Record<string, unknown>
  createdAt: string
}
