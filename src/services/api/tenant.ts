import type { TenantProfile } from '@/types/tenant'
import { apiRequest } from '@/services/http'

export const tenantApi = {
  getMe () {
    return apiRequest<TenantProfile>('/tenants/me')
  },
}
