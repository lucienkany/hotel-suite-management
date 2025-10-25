import { Prisma } from '@prisma/client';

// ==================== Company Types ====================
export type Company = Prisma.CompanyGetPayload<{}>;

export type CompanyWithUsers = Prisma.CompanyGetPayload<{
  include: { users: true };
}>;

export type CompanyWithRooms = Prisma.CompanyGetPayload<{
  include: { rooms: true };
}>;

// ==================== User Types ====================
export type User = Prisma.UserGetPayload<{}>;

export type UserWithCompany = Prisma.UserGetPayload<{
  include: { company: true };
}>;

// ==================== Room Types ====================
export type Room = Prisma.RoomGetPayload<{}>;

export type RoomWithType = Prisma.RoomGetPayload<{
  include: { roomType: true };
}>;

export type RoomWithCompany = Prisma.RoomGetPayload<{
  include: { company: true };
}>;

export type RoomWithAll = Prisma.RoomGetPayload<{
  include: {
    roomType: true;
    company: true;
    stays: true;
  };
}>;

// ==================== RoomType Types ====================
export type RoomType = Prisma.RoomTypeGetPayload<{}>;

export type RoomTypeWithRooms = Prisma.RoomTypeGetPayload<{
  include: { rooms: true };
}>;

export type RoomTypeWithCompany = Prisma.RoomTypeGetPayload<{
  include: { company: true };
}>;

// ==================== Client Types ====================
export type Client = Prisma.ClientGetPayload<{}>;

export type ClientWithStays = Prisma.ClientGetPayload<{
  include: { stays: true };
}>;

export type ClientWithCompany = Prisma.ClientGetPayload<{
  include: { company: true };
}>;

// ==================== Stay Types ====================
export type Stay = Prisma.StayGetPayload<{}>;

export type StayWithRoom = Prisma.StayGetPayload<{
  include: { room: true };
}>;

export type StayWithClient = Prisma.StayGetPayload<{
  include: { client: true };
}>;

export type StayWithAll = Prisma.StayGetPayload<{
  include: {
    room: {
      include: {
        roomType: true;
      };
    };
    client: true;
    restaurantOrders: true;
    laundryOrders: true;
    supermarketOrders: true;
    sportReservations: true;
  };
}>;

// ==================== Product Types ====================
export type Product = Prisma.ProductGetPayload<{}>;

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export type ProductWithCompany = Prisma.ProductGetPayload<{
  include: { company: true };
}>;

export type ProductWithAll = Prisma.ProductGetPayload<{
  include: {
    category: true;
    company: true;
  };
}>;

// ==================== Category Types ====================
export type Category = Prisma.CategoryGetPayload<{}>;

export type CategoryWithProducts = Prisma.CategoryGetPayload<{
  include: { products: true };
}>;

export type CategoryWithCompany = Prisma.CategoryGetPayload<{
  include: { company: true };
}>;

// ==================== RestaurantOrder Types ====================
export type RestaurantOrder = Prisma.RestaurantOrderGetPayload<{}>;

export type RestaurantOrderWithStay = Prisma.RestaurantOrderGetPayload<{
  include: { stay: true };
}>;

export type RestaurantOrderWithProduct = Prisma.RestaurantOrderGetPayload<{
  include: { product: true };
}>;

export type RestaurantOrderWithAll = Prisma.RestaurantOrderGetPayload<{
  include: {
    stay: {
      include: {
        room: true;
        client: true;
      };
    };
    product: true;
  };
}>;

// ==================== LaundryOrder Types ====================
export type LaundryOrder = Prisma.LaundryOrderGetPayload<{}>;

export type LaundryOrderWithStay = Prisma.LaundryOrderGetPayload<{
  include: { stay: true };
}>;

export type LaundryOrderWithProduct = Prisma.LaundryOrderGetPayload<{
  include: { product: true };
}>;

export type LaundryOrderWithAll = Prisma.LaundryOrderGetPayload<{
  include: {
    stay: {
      include: {
        room: true;
        client: true;
      };
    };
    product: true;
  };
}>;

// ==================== SupermarketOrder Types ====================
export type SupermarketOrder = Prisma.SupermarketOrderGetPayload<{}>;

export type SupermarketOrderWithStay = Prisma.SupermarketOrderGetPayload<{
  include: { stay: true };
}>;

export type SupermarketOrderWithProduct = Prisma.SupermarketOrderGetPayload<{
  include: { product: true };
}>;

export type SupermarketOrderWithAll = Prisma.SupermarketOrderGetPayload<{
  include: {
    stay: {
      include: {
        room: true;
        client: true;
      };
    };
    product: true;
  };
}>;

// ==================== SportReservation Types ====================
export type SportReservation = Prisma.SportReservationGetPayload<{}>;

export type SportReservationWithStay = Prisma.SportReservationGetPayload<{
  include: { stay: true };
}>;

export type SportReservationWithProduct = Prisma.SportReservationGetPayload<{
  include: { product: true };
}>;

export type SportReservationWithAll = Prisma.SportReservationGetPayload<{
  include: {
    stay: {
      include: {
        room: true;
        client: true;
      };
    };
    product: true;
  };
}>;

// ==================== Enums ====================
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum StayStatus {
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  RESERVED = 'RESERVED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProductType {
  RESTAURANT = 'RESTAURANT',
  LAUNDRY = 'LAUNDRY',
  SUPERMARKET = 'SUPERMARKET',
  SPORT = 'SPORT',
}