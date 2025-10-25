// frontend/src/types/index.ts
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: number;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: number;
  name: string;
  roomNumber: string;
  floor: number;
  roomTypeId: number;
  roomType?: RoomType;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  price: number;
}

export interface RoomType {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  capacity: number;
  amenities?: string[];
}

export interface Stay {
  id: number;
  clientId: number;
  client?: Client;
  roomId: number;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  status: 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  numberOfGuests: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: Category;
  price: number;
  unit: string;
  stock: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface SportReservation {
  id: number;
  clientId: number;
  client?: Client;
  stayId?: number;
  stay?: Stay;
  reservationDate: string;
  startTime: string;
  endTime: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceMode: 'WALK_IN' | 'HOTEL_GUEST';
  facilityType?: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  paidAmount: number;
  items?: SportReservationItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SportReservationItem {
  id: number;
  reservationId: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  currentGuests: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  totalRevenue: number;
  monthlyRevenue: number;
}
