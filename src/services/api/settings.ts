import type {
  TenantSettings,
  TenantSettingsAuditEntry,
  TenantSettingsUpdatePayload,
} from '@/types/settings'
import { apiRequest } from '@/services/http'

export const settingsApi = {
  getSettings () {
    return apiRequest<TenantSettings>('/settings')
  },

  updateSettings (payload: TenantSettingsUpdatePayload) {
    return apiRequest<TenantSettings>('/settings', {
      method: 'PATCH',
      body: payload,
    })
  },

  listAudit () {
    return apiRequest<TenantSettingsAuditEntry[]>('/settings/audit')
  },
}
