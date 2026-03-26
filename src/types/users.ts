export interface RoleSummary {
  id: string
  name: string
  description?: string
  isSystem: boolean
}

export interface UserRoleAssignment {
  id: string
  userId: string
  roleId: string
  role?: RoleSummary
}

export interface TenantUser {
  id: string
  tenantId: string
  name: string
  email: string
  isActive: boolean
  tokenVersion: number
  createdAt: string
  updatedAt: string
  userRoles?: UserRoleAssignment[]
}

export interface UsersListQuery {
  page?: number
  limit?: number
}
