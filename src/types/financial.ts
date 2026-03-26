import type { NumericLike, ShipmentStatus } from './operations'

export type FinancialEntryStatus = 'OPEN' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELED'
export type CashFlowType = 'IN' | 'OUT'
export type CashFlowReferenceType = 'PAYABLE' | 'RECEIVABLE' | 'TRANSFER'

export interface Customer {
  id: string
  tenantId: string
  name: string
  documentNumber: string
  email?: string | null
  phone?: string | null
  isActive: boolean
}

export interface Supplier {
  id: string
  tenantId: string
  name: string
  documentNumber: string
  email?: string | null
  phone?: string | null
  isActive: boolean
}

export interface AccountsReceivableEntry {
  id: string
  tenantId: string
  documentNumber?: string | null
  description: string
  customerId?: string | null
  costCenterId?: string | null
  categoryId?: string | null
  paymentMethodId?: string | null
  chartAccountId?: string | null
  recurrenceRuleId?: string | null
  interestFineRuleId?: string | null
  installmentNumber: number
  installmentCount: number
  issueDate: string
  dueDate: string
  amount: NumericLike
  discountAmount: NumericLike
  interestAmount: NumericLike
  fineAmount: NumericLike
  receivedAmount: NumericLike
  status: FinancialEntryStatus
  liquidatedAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountsPayableEntry {
  id: string
  tenantId: string
  documentNumber?: string | null
  description: string
  supplierId?: string | null
  costCenterId?: string | null
  categoryId?: string | null
  paymentMethodId?: string | null
  chartAccountId?: string | null
  recurrenceRuleId?: string | null
  interestFineRuleId?: string | null
  installmentNumber: number
  installmentCount: number
  issueDate: string
  dueDate: string
  amount: NumericLike
  discountAmount: NumericLike
  interestAmount: NumericLike
  fineAmount: NumericLike
  paidAmount: NumericLike
  status: FinancialEntryStatus
  liquidatedAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface CashFlowEntry {
  id: string
  tenantId: string
  bankAccountId: string
  referenceType: CashFlowReferenceType
  referenceId: string
  amount: NumericLike
  type: CashFlowType
  date: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface FinancialPeriodQuery {
  page?: number
  limit?: number
  from?: string
  to?: string
  costCenterId?: string
  status?: FinancialEntryStatus
}

export interface CashFlowListQuery {
  page?: number
  limit?: number
  bankAccountId?: string
  referenceType?: CashFlowReferenceType
  type?: CashFlowType
  from?: string
  to?: string
}

export interface FinancialDashboardReport {
  period: {
    from: string | null
    to: string | null
  }
  payable: {
    total: number
    paid: number
    open: number
    overdueCount: number
  }
  receivable: {
    total: number
    received: number
    open: number
    overdueCount: number
  }
  netBalance: number
}

export interface FinancialCashFlowReport {
  period: {
    from: string | null
    to: string | null
  }
  totalIn: number
  totalOut: number
  balance: number
}

export interface FinancialOverdueReport {
  payables: AccountsPayableEntry[]
  receivables: AccountsReceivableEntry[]
  totals: {
    payableCount: number
    receivableCount: number
  }
}

export interface ShipmentProfitabilityItem {
  shipmentId: string
  orderId: string
  driverId: string | null
  vehicleId: string | null
  routeId: string | null
  status: ShipmentStatus
  deliveryDate: string | null
  revenue: number
  costBreakdown: {
    driverPayment: number
    maintenanceProportional: number
    fuelEstimated: number
    tollEstimated: number
  }
  totalCost: number
  profit: number
  marginPercent: number
}

export interface ShipmentProfitabilityReport {
  period: {
    from: string | null
    to: string | null
  }
  filters: {
    status: ShipmentStatus
    driverId: string | null
    vehicleId: string | null
    routeId: string | null
  }
  totals: {
    shipmentCount: number
    revenue: number
    totalCost: number
    profit: number
    marginPercent: number
  }
  items: ShipmentProfitabilityItem[]
}

export interface ShipmentProfitabilityQuery {
  page?: number
  limit?: number
  from?: string
  to?: string
  status?: ShipmentStatus
  driverId?: string
  vehicleId?: string
  routeId?: string
  fuelCostPerKm?: number
  tollCostPerKm?: number
}
