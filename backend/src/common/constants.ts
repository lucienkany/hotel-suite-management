// Role enum
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  RECEPTIONIST = 'RECEPTIONIST',
  WAITER = 'WAITER',
  CASHIER = 'CASHIER',
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Export as arrays for validation
export const USER_ROLES = Object.values(UserRole);
export const USER_STATUSES = Object.values(UserStatus);

// Room status enum
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export const ROOM_STATUSES = Object.values(RoomStatus);

// Room type enum
export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
}

export const ROOM_TYPES = Object.values(RoomType);

// Stay status enum
export enum StayStatus {
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

export const STAY_STATUSES = Object.values(StayStatus);

// Customer type enum
export enum CustomerType {
  WALK_IN = 'WALK_IN',
  CORPORATE = 'CORPORATE',
  REGULAR = 'REGULAR',
}

export const CUSTOMER_TYPES = Object.values(CustomerType);

// Category type enum
export enum CategoryType {
  MINIBAR = 'MINIBAR',
  RESTAURANT = 'RESTAURANT',
  SUPERMARKET = 'SUPERMARKET',
  LAUNDRY = 'LAUNDRY',
  SPORT = 'SPORT',
  BARBER = 'BARBER',
}

export const CATEGORY_TYPES = Object.values(CategoryType);

// Service mode enum
export enum ServiceMode {
  WALK_IN = 'WALK_IN',
  ROOM_SERVICE = 'ROOM_SERVICE',
  DELIVERY = 'DELIVERY',
}

export const SERVICE_MODES = Object.values(ServiceMode);

// Payment status enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export const PAYMENT_STATUSES = Object.values(PaymentStatus);

// Order status enum
export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const ORDER_STATUSES = Object.values(OrderStatus);

// Table status enum
export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
}

export const TABLE_STATUSES = Object.values(TableStatus);

export enum ExpenseCategory {
  UTILITIES = 'UTILITIES',
  MAINTENANCE = 'MAINTENANCE',
  SALARIES = 'SALARIES',
  SUPPLIES = 'SUPPLIES',
  MARKETING = 'MARKETING',
  INSURANCE = 'INSURANCE',
  TAXES = 'TAXES',
  RENT = 'RENT',
  EQUIPMENT = 'EQUIPMENT',
  OTHER = 'OTHER',
}

export enum TransactionType {
  BOOKING_PAYMENT = 'BOOKING_PAYMENT',
  RESTAURANT_PAYMENT = 'RESTAURANT_PAYMENT',
  BAR_PAYMENT = 'BAR_PAYMENT',
  SUPERMARKET_PAYMENT = 'SUPERMARKET_PAYMENT',
  EXPENSE = 'EXPENSE',
  REFUND = 'REFUND',
  OTHER = 'OTHER',
}

// // Role enum
// export enum UserRole {
//   SUPER_ADMIN = 'SUPER_ADMIN',
//   ADMIN = 'ADMIN',
//   MANAGER = 'MANAGER',
//   STAFF = 'STAFF',
//   RECEPTIONIST = 'RECEPTIONIST',
// }

// // User status enum
// export enum UserStatus {
//   ACTIVE = 'active',
//   INACTIVE = 'inactive',
//   SUSPENDED = 'suspended',
// }

// // Export as arrays for validation
// export const USER_ROLES = Object.values(UserRole);
// export const USER_STATUSES = Object.values(UserStatus);

// // Room status enum
// export enum RoomStatus {
//   AVAILABLE = 'AVAILABLE',
//   OCCUPIED = 'OCCUPIED',
//   MAINTENANCE = 'MAINTENANCE',
//   RESERVED = 'RESERVED',
// }

// export const ROOM_STATUSES = Object.values(RoomStatus);

// // Room type enum
// export enum RoomType {
//   SINGLE = 'SINGLE',
//   DOUBLE = 'DOUBLE',
//   SUITE = 'SUITE',
//   DELUXE = 'DELUXE',
// }

// export const ROOM_TYPES = Object.values(RoomType);

// // Stay status enum
// export enum StayStatus {
//   CONFIRMED = 'confirmed',
//   CHECKED_IN = 'checked_in',
//   CHECKED_OUT = 'checked_out',
//   CANCELLED = 'cancelled',
// }

// export const STAY_STATUSES = Object.values(StayStatus);

// // Customer type enum
// export enum CustomerType {
//   WALK_IN = 'WALK_IN',
//   CORPORATE = 'CORPORATE',
//   REGULAR = 'REGULAR',
// }

// export const CUSTOMER_TYPES = Object.values(CustomerType);

// // Category type enum
// export enum CategoryType {
//   MINIBAR = 'MINIBAR',
//   RESTAURANT = 'RESTAURANT',
//   SUPERMARKET = 'SUPERMARKET',
//   LAUNDRY = 'LAUNDRY',
//   SPORT = 'SPORT',
//   BARBER = 'BARBER',
// }

// export const CATEGORY_TYPES = Object.values(CategoryType);

// // Service mode enum
// export enum ServiceMode {
//   WALK_IN = 'WALK_IN',
//   ROOM_SERVICE = 'ROOM_SERVICE',
//   DELIVERY = 'DELIVERY',
// }

// export const SERVICE_MODES = Object.values(ServiceMode);

// // Payment status enum
// export enum PaymentStatus {
//   PENDING = 'PENDING',
//   PARTIAL = 'PARTIAL',
//   PAID = 'PAID',
//   REFUNDED = 'REFUNDED',
// }

// export const PAYMENT_STATUSES = Object.values(PaymentStatus);

// // Order status enum
// export enum OrderStatus {
//   PENDING = 'PENDING',
//   PREPARING = 'PREPARING',
//   READY = 'READY',
//   DELIVERED = 'DELIVERED',
//   COMPLETED = 'COMPLETED',
//   CANCELLED = 'CANCELLED',
// }

// //table status
// export enum TableStatus {
//   FREE = 'FREE',
// }

// export const ORDER_STATUSES = Object.values(OrderStatus);
