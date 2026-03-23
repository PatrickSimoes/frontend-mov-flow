import type { ModuleCode } from '@/types/auth'

export interface CapabilityItem {
  title: string
  description: string
  endpoints: string[]
  workflows?: string[]
  permissionsAny?: string[]
  permissionsAll?: string[]
  modulesAny?: ModuleCode[]
  modulesAll?: ModuleCode[]
}
