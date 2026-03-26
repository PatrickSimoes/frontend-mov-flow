export type NumericLike = number | string

export type OrderStatus = 'OPEN' | 'CONFIRMED' | 'SHIPPED' | 'CLOSED' | 'CANCELED'
export type ShipmentStatus = 'CREATED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELED'
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
export type VehicleType = 'TRUCK' | 'VAN' | 'CAR' | 'MOTORCYCLE' | 'TRACTOR' | 'OTHER'

export interface Order {
  id: string
  tenantId: string
  orderNumber: string
  customerId: string
  totalValue: NumericLike
  description?: string | null
  status: OrderStatus
  receivableId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Shipment {
  id: string
  tenantId: string
  orderId: string
  driverId?: string | null
  vehicleId?: string | null
  routeId?: string | null
  freightTableId?: string | null
  receivableId?: string | null
  driverPaymentId?: string | null
  freightValue: NumericLike
  cargoWeightKg?: NumericLike | null
  departureDate?: string | null
  deliveryDate?: string | null
  status: ShipmentStatus
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  tenantId: string
  plate: string
  brand: string
  model: string
  year: number
  capacityKg: NumericLike
  vehicleType: VehicleType
  status: VehicleStatus
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: string
  tenantId: string
  name: string
  documentNumber?: string | null
  phone?: string | null
  email?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Route {
  id: string
  tenantId: string
  name: string
  origin: string
  destination: string
  estimatedDistanceKm: NumericLike
  estimatedDurationMinutes: number
  createdAt: string
  updatedAt: string
}

export interface OrdersListQuery {
  page?: number
  limit?: number
  status?: OrderStatus
  customerId?: string
  orderNumber?: string
}

export interface ShipmentsListQuery {
  page?: number
  limit?: number
  status?: ShipmentStatus
  orderId?: string
  driverId?: string
  vehicleId?: string
}

export interface VehiclesListQuery {
  page?: number
  limit?: number
  status?: VehicleStatus
  vehicleType?: VehicleType
  search?: string
}

export interface DriversListQuery {
  page?: number
  limit?: number
  search?: string
}

export interface RoutesListQuery {
  page?: number
  limit?: number
  search?: string
}
