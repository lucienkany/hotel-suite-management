# Hotel Suite Management System - Project Context

## 📋 Project Overview

Full-stack hotel suite management system built with NestJS (backend) and Next.js (frontend).

## 🎯 Current Status

### ✅ Completed Components

#### Backend (NestJS)

- **Authentication Module**: JWT-based auth with login/register
- **Users Module**: User CRUD operations with role management
- **Categories Module**: Category management for suite classification
- **Database**: SqlServer with Prisma ORM
- **API Documentation**: Swagger/OpenAPI available at /api

#### Frontend (Next.js)

- **Authentication Flow**: Login and registration pages
- **Dashboard Layout**: Protected routes with navigation
- **Type Safety**: Full TypeScript implementation
- **Styling**: TailwindCSS for responsive design

### 🚧 In Progress / Planned

- Suites management module
- Bookings system
- Payment integration
- Reporting dashboard

## 🏗 Architecture

### Tech Stack

- **Backend**: NestJS, sqlserver, Prisma, JWT, Passport
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Database**: PostgreSQL
- **Auth**: JWT tokens with refresh mechanism

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT access token (15min) + refresh token (7d)
3. Frontend stores tokens
4. Protected routes verify token
5. Auto-refresh on token expiry
