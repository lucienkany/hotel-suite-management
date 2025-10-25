# Backend API Endpoints Reference

Base URL: http://localhost:4000

API Documentation: http://localhost:4000/api (Swagger)

---

## Authentication Endpoints

### Register New User

POST /auth/register
Content-Type: application/json

{
"email": "user@example.com",
"password": "SecurePass123!",
"firstName": "John",
"lastName": "Doe"
}

Response (201):
{
"access_token": "eyJhbGc...",
"refresh_token": "eyJhbGc...",
"user": {
"id": 1,
"email": "user@example.com",
"firstName": "John",
"lastName": "Doe",
"role": "STAFF"
}
}

### Login

POST /auth/login
Content-Type: application/json

{
"email": "user@example.com",
"password": "SecurePass123!"
}

### Get Current User

GET /auth/me
Authorization: Bearer {access_token}

### Refresh Token

POST /auth/refresh
Content-Type: application/json

{
"refresh_token": "eyJhbGc..."
}

---

## Users Endpoints

### Get All Users (Admin Only)

GET /users
Authorization: Bearer {access_token}

### Get User by ID

GET /users/:id
Authorization: Bearer {access_token}

### Update User

PATCH /users/:id
Authorization: Bearer {access_token}

### Delete User

DELETE /users/:id
Authorization: Bearer {access_token}

---

## Categories Endpoints

### Get All Categories

GET /categories
Authorization: Bearer {access_token}

### Create Category

POST /categories
Authorization: Bearer {access_token}

### Update Category

PATCH /categories/:id
Authorization: Bearer {access_token}

### Delete Category

DELETE /categories/:id
Authorization: Bearer {access_token}

---

## Authorization Roles

- **ADMIN**: Full access to all endpoints
- **MANAGER**: Access to categories and own user data
- **STAFF**: Limited access, read-only for most resources
