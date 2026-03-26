import type {
  AccountsPayableEntry,
  AccountsReceivableEntry,
  CashFlowEntry,
  CashFlowListQuery,
  Customer,
  FinancialCashFlowReport,
  FinancialDashboardReport,
  FinancialOverdueReport,
  FinancialPeriodQuery,
  ShipmentProfitabilityQuery,
  ShipmentProfitabilityReport,
  Supplier,
} from '@/types/financial'
import { apiRequest } from '@/services/http'

export const financialApi = {
  listAccountsReceivable (query: FinancialPeriodQuery = {}) {
    return apiRequest<AccountsReceivableEntry[]>('/financial/accounts-receivable', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        costCenterId: query.costCenterId,
        status: query.status,
      },
    })
  },

  listAccountsPayable (query: FinancialPeriodQuery = {}) {
    return apiRequest<AccountsPayableEntry[]>('/financial/accounts-payable', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        costCenterId: query.costCenterId,
        status: query.status,
      },
    })
  },

  listCashFlow (query: CashFlowListQuery = {}) {
    return apiRequest<CashFlowEntry[]>('/financial/cash-flow', {
      query: {
        page: query.page,
        limit: query.limit,
        bankAccountId: query.bankAccountId,
        referenceType: query.referenceType,
        type: query.type,
        from: query.from,
        to: query.to,
      },
    })
  },

  getDashboardReport (query: FinancialPeriodQuery = {}) {
    return apiRequest<FinancialDashboardReport>('/financial/reports/dashboard', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        costCenterId: query.costCenterId,
        status: query.status,
      },
    })
  },

  getCashFlowReport (query: FinancialPeriodQuery = {}) {
    return apiRequest<FinancialCashFlowReport>('/financial/reports/cash-flow', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        costCenterId: query.costCenterId,
        status: query.status,
      },
    })
  },

  getOverdueReport (query: FinancialPeriodQuery = {}) {
    return apiRequest<FinancialOverdueReport>('/financial/reports/overdue', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        costCenterId: query.costCenterId,
        status: query.status,
      },
    })
  },

  getShipmentProfitability (query: ShipmentProfitabilityQuery = {}) {
    return apiRequest<ShipmentProfitabilityReport>('/financial/reports/shipment-profitability', {
      query: {
        page: query.page,
        limit: query.limit,
        from: query.from,
        to: query.to,
        status: query.status,
        driverId: query.driverId,
        vehicleId: query.vehicleId,
        routeId: query.routeId,
        fuelCostPerKm: query.fuelCostPerKm,
        tollCostPerKm: query.tollCostPerKm,
      },
    })
  },

  listCustomers () {
    return apiRequest<Customer[]>('/financial/master/customers')
  },

  listSuppliers () {
    return apiRequest<Supplier[]>('/financial/master/suppliers')
  },
}
