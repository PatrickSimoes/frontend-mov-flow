import type {
  CheckoutSessionPayload,
  CheckoutSessionResponse,
  EnabledModulesResponse,
  SaaSPayment,
  SaaSPlan,
  SaaSSubscription,
  TenantUsage,
} from '@/types/saas'
import { apiRequest } from '@/services/http'

export const saasApi = {
  listPlans () {
    return apiRequest<SaaSPlan[]>('/saas/plans')
  },

  getCurrentSubscription () {
    return apiRequest<SaaSSubscription>('/saas/subscriptions/current')
  },

  checkout (payload: CheckoutSessionPayload) {
    return apiRequest<CheckoutSessionResponse>('/saas/subscriptions/checkout', {
      method: 'POST',
      body: payload,
    })
  },

  listPayments () {
    return apiRequest<SaaSPayment[]>('/saas/payments')
  },

  listUsage () {
    return apiRequest<TenantUsage[]>('/saas/usage')
  },

  listEnabledModules () {
    return apiRequest<EnabledModulesResponse>('/saas/tenant-modules/enabled')
  },
}
