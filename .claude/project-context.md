# Hotel Suite Management System - AI Context

## Project Overview

Full-stack hotel management system for managing rooms, reservations, restaurant orders, laundry, supermarket, and sports facilities.

## Technology Stack

### Backend (Port 4000)

- **Framework:** NestJS 10.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + bcrypt
- **Validation:** class-validator, class-transformer
- **Location:** `D:\claudeAI\hotel-suite\backend`

### Frontend (Port 3000)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** TanStack Query
- **Location:** `D:\claudeAI\hotel-suite\frontend`

## Database Schema

### Core Entities

1. **Company** - Multi-tenant support
2. **User** - Staff members (ADMIN, MANAGER, STAFF, RECEPTIONIST)
3. **Room & RoomType** - Room inventory
4. **Client** - Hotel guests
5. **Stay** - Check-in/out records
6. **RestaurantOrder** - Food orders
7. **LaundryOrder** - Laundry services
8. **SupermarketOrder** - Minibar/shop orders
9. **SportReservation** - Sports facility bookings
10. **Product & Category** - Inventory management

### Key Relationships

- Company → Users (one-to-many)
- Room → RoomType (many-to-one)
- Stay → Room + Client (many-to-one each)
- Orders → Stay (many-to-one)

## API Structure

### Authentication

- POST `/auth/signup-company` - Register company + admin
- POST `/auth/login` - User login
- POST `/auth/register` - Register new user (admin only)

### Key Endpoints

- `/rooms` - Room CRUD
- `/stays` - Reservation management
- `/restaurant-orders` - Restaurant orders
- `/laundry-orders` - Laundry management
- `/supermarket-orders` - Shop orders
- `/sport-reservations` - Sports bookings
- `/products` - Product inventory
- `/clients` - Client management

## Environment Setup

### Backend `.env`

```env
# Database
DATABASE_URL="sqlserver://LKFONE:1433;database=HS005;user=sa;password={expat@gfi.com};encrypt=true;trustServerCertificate=true"
```
