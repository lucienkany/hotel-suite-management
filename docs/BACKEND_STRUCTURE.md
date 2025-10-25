# Backend Structure Documentation

## 📂 Complete Project Structure

\\\
backend/
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts           # Root module
│   ├── app.service.ts
│   ├── main.ts                 # Entry point
│   │
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   ├── accept-invitation.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── signup-company.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── categories/             # Categories module
│   │   ├── categories.controller.ts
│   │   ├── categories.module.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── clients/                # Clients module
│   │   ├── clients.controller.ts
│   │   ├── clients.module.ts
│   │   ├── clients.service.ts
│   │   └── dto/
│   │       ├── create-client.dto.ts
│   │       └── update-client.dto.ts
│   │
│   ├── common/                 # Shared utilities
│   │   ├── common.module.ts
│   │   ├── constants.ts
│   │   └── lookup.service.ts
│   │
│   ├── invitation/             # Invitation module
│   │   ├── invitation.controller.ts
│   │   ├── invitation.module.ts
│   │   ├── invitation.service.ts
│   │   └── dto/
│   │       ├── cancel-invitation.dto.ts
│   │       ├── create-invitation.dto.ts
│   │       └── resend-invitation.dto.ts
│   │
│   ├── laundry-orders/         # Laundry orders module
│   │   ├── laundry-orders.controller.ts
│   │   ├── laundry-orders.module.ts
│   │   ├── laundry-orders.service.ts
│   │   └── dto/
│   │       ├── add-items.dto.ts
│   │       ├── create-laundry-order.dto.ts
│   │       ├── update-items.dto.ts
│   │       └── update-laundry-order.dto.ts
│   │
│   ├── prisma/                 # Database module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── products/               # Products module
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       ├── update-product.dto.ts
│   │       └── update-stock.dto.ts
│   │
│   ├── restaurant-orders/      # Restaurant orders module
│   │   ├── restaurant-orders.controller.ts
│   │   ├── restaurant-orders.module.ts
│   │   ├── restaurant-orders.service.ts
│   │   └── dto/
│   │       ├── add-order-items.dto.ts
│   │       ├── create-restaurant-order-item.dto.ts
│   │       ├── create-restaurant-order.dto.ts
│   │       ├── pay-order.dto.ts
│   │       └── update-restaurant-order.dto.ts
│   │
│   ├── restaurant-tables/      # Restaurant tables module
│   │   ├── restaurant-tables.controller.ts
│   │   ├── restaurant-tables.module.ts
│   │   ├── restaurant-tables.service.ts
│   │   └── dto/
│   │       ├── assign-table.dto.ts
│   │       ├── create-restaurant-table.dto.ts
│   │       └── update-restaurant-table.dto.ts
│   │
│   ├── room/                   # Rooms module
│   │   ├── room.controller.ts
│   │   ├── room.module.ts
│   │   ├── room.service.ts
│   │   └── dto/
│   │       ├── create-room.dto.ts
│   │       ├── update-room-status.dto.ts
│   │       └── update-room.dto.ts
│   │
│   ├── room-type/              # Room types module
│   │   ├── room-type.controller.ts
│   │   ├── room-type.module.ts
│   │   ├── room-type.service.ts
│   │   ├── dto/
│   │   │   ├── create-room-type.dto.ts
│   │   │   └── update-room-type.dto.ts
│   │   └── entities/
│   │       └── room-type.entity.ts
│   │
│   ├── sport-reservations/     # Sport reservations module
│   │   ├── sport-reservations.controller.ts
│   │   ├── sport-reservations.module.ts
│   │   ├── sport-reservations.service.ts
│   │   └── dto/
│   │       ├── create-sport-reservation.dto.ts
│   │       └── update-sport-reservation.dto.ts
│   │
│   ├── stays/                  # Stays (check-in/out) module
│   │   ├── stays.controller.ts
│   │   ├── stays.module.ts
│   │   ├── stays.service.ts
│   │   └── dto/
│   │       ├── check-in.dto.ts
│   │       ├── check-out.dto.ts
│   │       ├── create-stay.dto.ts
│   │       └── update-stay.dto.ts
│   │
│   ├── supermarket-orders/     # Supermarket orders module
│   │   ├── supermarket-orders.controller.ts
│   │   ├── supermarket-orders.module.ts
│   │   ├── supermarket-orders.service.ts
│   │   └── dto/
│   │       ├── add-items.dto.ts
│   │       ├── create-supermarket-order.dto.ts
│   │       ├── update-item.dto.ts
│   │       └── update-supermarket-order.dto.ts
│   │
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   │
│   └── user/                   # Users module
│       ├── user.controller.ts
│       ├── user.module.ts
│       ├── user.service.ts
│       └── dto/
│           ├── change-password.dto.ts
│           ├── create-user.dto.ts
│           └── update-user.dto.ts
└── ...config files
\\\

## 🏗 Architecture Overview

### Module Structure
- **Core**: app, auth, user, prisma, common
- **Room Management**: room, room-type, stays
- **Client Management**: clients, invitation
- **Orders**: restaurant-orders, laundry-orders, supermarket-orders
- **Services**: categories, products, restaurant-tables, sport-reservations

### Authentication & Authorization
- **JWT Strategy**: Token-based authentication
- **Guards**: jwt-auth.guard, roles.guard
- **Decorators**: @CurrentUser(), @Roles()
- **Company-based**: Multi-tenant architecture with signup-company

### Database Layer
- **ORM**: Prisma
- **Database**: SQL Server
- **Service**: Centralized PrismaService

### Key Features
- Role-based access control (RBAC)
- Multi-tenant support (companies)
- Invitation system for users
- Complete hotel management (rooms, orders, reservations)

## 🔐 Security
- JWT authentication
- Password hashing
- Role-based guards
- Input validation with DTOs
