import type { ModuleCode } from '@/core/types/auth'

export type ResourceSection = 'admin' | 'operations' | 'financial'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'switch'
  | 'password'

export interface SelectOption {
  label: string
  value: string | number | boolean
}

export interface OptionSource {
  endpoint: string
  labelKey: string
  valueKey?: string
  query?: Record<string, string | number | boolean>
}

export interface FormField {
  key: string
  label: string
  type: FieldType
  required?: boolean
  readonly?: boolean
  min?: number
  max?: number
  step?: number
  placeholder?: string
  hint?: string
  options?: SelectOption[]
  optionSource?: OptionSource
}

export type ColumnType = 'text' | 'date' | 'datetime' | 'money' | 'status' | 'boolean'

export interface ColumnDef {
  key: string
  title: string
  path: string
  type?: ColumnType
  currencyPath?: string
  width?: number
}

export interface FilterDef {
  key: string
  label: string
  type: 'text' | 'select' | 'date'
  options?: SelectOption[]
}

export interface ActionConfig {
  id: string
  label: string
  method: 'POST' | 'PATCH'
  path: string
  permission?: string
  color?: 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success'
  icon?: string
  confirmMessage?: string
  fields?: FormField[]
}

export interface AttachmentConfig {
  listPath: string
  createPath: string
  permissionRead: string
  permissionCreate: string
}

export interface ResourcePermissions {
  read: string
  create?: string
  update?: string
  remove?: string
}

export interface ResourceDefinition {
  key: string
  section: ResourceSection
  title: string
  subtitle: string
  routePath: string
  icon: string
  moduleAccess?: ModuleCode
  basePath: string
  permissions: ResourcePermissions
  columns: ColumnDef[]
  fields: FormField[]
  filters?: FilterDef[]
  defaultLimit?: number
  hideCreate?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
  listDisabled?: boolean
  customActions?: ActionConfig[]
  attachments?: AttachmentConfig
}

export interface ReportDefinition {
  key: string
  title: string
  routePath: string
  endpoint: string
  permission: string
  moduleAccess: ModuleCode
  filters: FilterDef[]
}
