import type { ModuleCode } from './auth'

export interface SaaSPlan {
  id: string
  name: string
  code: string
  description?: string
  monthlyPrice: number
  currency: string
  maxUsers?: number | null
  maxVehicles?: number | null
  maxShipments?: number | null
  isActive: boolean
}

export interface SaaSSubscription {
  id: string
  tenantId: string
  planId: string
  plan?: SaaSPlan
  status: 'INCOMPLETE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
  startsAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string | null
  isCurrent: boolean
}

export interface SaaSPayment {
  id: string
  subscriptionId: string
  provider: 'INTERNAL' | 'STRIPE'
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED' | 'REFUNDED'
  dueDate?: string | null
  paidAt?: string | null
  createdAt: string
}

export interface TenantUsage {
  id: string
  metric: string
  usageCount: number
  periodStart: string
  periodEnd: string
}

export interface CheckoutSessionPayload {
  planId: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSessionResponse {
  id: string
  url: string
}

export type EnabledModulesResponse = ModuleCode[]
