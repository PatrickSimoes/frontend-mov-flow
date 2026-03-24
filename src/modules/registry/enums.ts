import type { SelectOption } from './types'

function enumOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({
    label: value.replace(/_/g, ' '),
    value,
  }))
}

export const orderStatusOptions = enumOptions([
  'OPEN',
  'CONFIRMED',
  'SHIPPED',
  'CLOSED',
  'CANCELED',
])
export const shipmentStatusOptions = enumOptions([
  'CREATED',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELED',
])
export const driverPaymentStatusOptions = enumOptions(['PENDING', 'PAID', 'CANCELED'])
export const driverPaymentTypeOptions = enumOptions([
  'FIXED_PER_SHIPMENT',
  'PERCENTAGE_OF_FREIGHT',
  'PER_KM',
])
export const vehicleStatusOptions = enumOptions(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
export const vehicleTypeOptions = enumOptions([
  'TRUCK',
  'VAN',
  'CAR',
  'MOTORCYCLE',
  'TRACTOR',
  'OTHER',
])
export const maintenanceTypeOptions = enumOptions(['PREVENTIVE', 'CORRECTIVE'])
export const maintenanceStatusOptions = enumOptions(['SCHEDULED', 'DONE', 'CANCELED'])

export const financialStatusOptions = enumOptions([
  'OPEN',
  'PAID',
  'PARTIAL',
  'OVERDUE',
  'CANCELED',
])
export const bankAccountTypeOptions = enumOptions(['CHECKING', 'SAVINGS'])
export const entryTypeOptions = enumOptions(['PAYABLE', 'RECEIVABLE'])
export const reconciliationStatusOptions = enumOptions(['PENDING', 'RECONCILED', 'DIVERGENT'])
export const cashFlowTypeOptions = enumOptions(['IN', 'OUT'])
export const cashFlowReferenceOptions = enumOptions(['PAYABLE', 'RECEIVABLE', 'TRANSFER'])

export const categoryTypeOptions = enumOptions(['EXPENSE', 'INCOME', 'BOTH'])
export const paymentMethodTypeOptions = enumOptions([
  'PIX',
  'BANK_TRANSFER',
  'BOLETO',
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'OTHER',
])
export const chartAccountNatureOptions = enumOptions(['ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE'])
export const recurrenceFrequencyOptions = enumOptions([
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'SEMIANNUAL',
  'YEARLY',
])

export const fiscalDocumentTypeOptions = enumOptions(['CTE', 'NFE', 'MDFE', 'NFSE', 'OTHER'])

export const paymentStatusOptions = enumOptions([
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELED',
  'REFUNDED',
])
export const subscriptionStatusOptions = enumOptions([
  'INCOMPLETE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
])
