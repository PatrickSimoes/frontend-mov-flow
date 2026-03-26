import type {
  Driver,
  DriversListQuery,
  Order,
  OrdersListQuery,
  Route,
  RoutesListQuery,
  Shipment,
  ShipmentsListQuery,
  Vehicle,
  VehiclesListQuery,
} from '@/types/operations'
import { apiRequest } from '@/services/http'

export const operationsApi = {
  listOrders (query: OrdersListQuery = {}) {
    return apiRequest<Order[]>('/orders', {
      query: {
        page: query.page,
        limit: query.limit,
        status: query.status,
        customerId: query.customerId,
        orderNumber: query.orderNumber,
      },
    })
  },

  listShipments (query: ShipmentsListQuery = {}) {
    return apiRequest<Shipment[]>('/shipments', {
      query: {
        page: query.page,
        limit: query.limit,
        status: query.status,
        orderId: query.orderId,
        driverId: query.driverId,
        vehicleId: query.vehicleId,
      },
    })
  },

  listVehicles (query: VehiclesListQuery = {}) {
    return apiRequest<Vehicle[]>('/vehicles', {
      query: {
        page: query.page,
        limit: query.limit,
        status: query.status,
        vehicleType: query.vehicleType,
        search: query.search,
      },
    })
  },

  listDrivers (query: DriversListQuery = {}) {
    return apiRequest<Driver[]>('/drivers', {
      query: {
        page: query.page,
        limit: query.limit,
        search: query.search,
      },
    })
  },

  listRoutes (query: RoutesListQuery = {}) {
    return apiRequest<Route[]>('/routes', {
      query: {
        page: query.page,
        limit: query.limit,
        search: query.search,
      },
    })
  },
}
