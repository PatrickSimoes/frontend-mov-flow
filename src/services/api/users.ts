import type { TenantUser, UsersListQuery } from '@/types/users'
import { apiRequest } from '@/services/http'

export const usersApi = {
  list(query: UsersListQuery = {}) {
    return apiRequest<TenantUser[]>('/users', {
      query: {
        page: query.page,
        limit: query.limit,
      },
    })
  },
}
