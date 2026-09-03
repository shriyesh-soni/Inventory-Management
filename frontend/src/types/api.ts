// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'MANAGER' | 'STAFF'
  createdAt: string
  updatedAt: string
  locationAssignments?: LocationAssignment[]
}

export interface LocationAssignment {
  id: string
  userId: string
  locationId: string
  assignedAt: string
  location: Location
}

// Item types
export interface Item {
  id: string
  sku: string
  name: string
  description?: string
  unit: string
  reorderLevel: number
  categoryId: string
  supplierId?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
  category: Category
  supplier?: Supplier
  totalOnHand?: number
  locations?: Array<{
    locationId: string
    locationName: string
    onHand: number
  }>
}

export interface Category {
  id: string
  name: string
  _count?: {
    items: number
  }
}

export interface Supplier {
  id: string
  name: string
  contact?: string
  email?: string
  phone?: string
  createdAt: string
  _count?: {
    items: number
  }
}

export interface Location {
  id: string
  name: string
  createdAt: string
  _count?: {
    assignments: number
    movements: number
  }
}

// Movement types
export interface StockMovement {
  id: string
  itemId: string
  kind: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT'
  quantity: number
  locationId: string
  sourceLocationId?: string
  destinationLocationId?: string
  reason?: string
  recordedById: string
  createdAt: string
  item: Item
  location: Location
  recordedBy: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Alert types
export interface LowStockAlert {
  id: string
  itemId: string
  dismissedAt?: string
  lastTriggeredQuantity: number
  item: Item
  currentOnHand: number
  locations: Array<{
    locationId: string
    locationName: string
    onHand: number
  }>
}

// Dashboard types
export interface DashboardStats {
  activeItems: number
  itemsBelowReorder: number
  movementsToday: number
  distinctItemsThisWeek: number
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  totalStock: number
  itemCount: number
}

export interface LocationBreakdown {
  locationId: string
  locationName: string
  totalStock: number
  itemCount: number
}

export interface MovementChartData {
  weekStart: string
  weekEnd: string
  label: string
  receipts: number
  issues: number
}

// Timeline types
export interface TimelineEntry {
  type: 'AUDIT_LOG' | 'NOTE'
  id: string
  itemId: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  createdAt: string
  // Audit log fields
  field?: string
  oldValue?: string
  newValue?: string
  // Note fields
  content?: string
}

// Auth specific types
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

// API response wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ImportResult {
  imported: number
  failed: Array<{
    row: number
    data: any
    reason: string
  }>
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  name: string
  role?: 'MANAGER' | 'STAFF'
}

export interface ItemForm {
  sku: string
  name: string
  description?: string
  unit: string
  reorderLevel: number
  categoryId: string
  supplierId?: string
}

export interface MovementForm {
  itemId: string
  locationId: string
  quantity: number
  reason?: string // Required for adjustments
}

export interface TransferForm {
  itemId: string
  sourceLocationId: string
  destinationLocationId: string
  quantity: number
}

// Query parameters
export interface ItemsQueryParams {
  search?: string
  categoryId?: string
  locationId?: string
  archived?: string
  belowReorder?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}