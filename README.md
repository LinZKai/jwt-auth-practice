# JWT Auth Practice Backend

A practice project for building a real-world-ish authentication flow:
- Register / Login with **bcrypt**
- **Access Token (JWT)** for API authorization
- **Refresh Token Rotation**
  - refresh token stored in **HttpOnly cookie**
  - only **token hash** stored in DB (safer)
  - old refresh token is **revoked** on refresh (rotation)
- Simple **EJS Playground UI** for convenient testing
- Request validation with **Zod**
- Refresh token cleanup strategy (remove expired + limit active sessions)

> This project is intended for learning and demo purposes.

## Tech Stack
- Node.js + TypeScript
- Express
- EJS (simple testing UI)
- PostgreSQL (Docker)
- Prisma ORM
- JWT (jsonwebtoken), bcrypt
- Zod validation

## Setup

### 1) Install dependencies
```bash
npm install
```
### 2) Create environment file
```bash
cp .env.example .env
```
### 3) Start PostgreSQL (Docker)
```bash
docker compose up -d
```
### 4) Run Prisma migration (create tables)
``` bash
npx prisma migrate dev
```
### 5) Start dev server
```bash
npm run dev
```

## API Endpoints
- Health
  - GET /health
- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout
- Protected
  - GET /api/me (Authorization: Bearer <accessToken>)

Open http://localhost:3000/auth to test API

## Testing (Jest)
This project uses **Jest + Supertest** for integration tests.

### Test Environment
Tests load environment variables from `.env.test`, so they can use a separate test database.

### Prepare Test DB (one-time)
Create a test database (if not created yet):
```bash
docker exec -it jwt_practice_pg psql -U app -d postgres
# then in psql:
CREATE DATABASE jwt_practice_test;
\q
```

Run migrations against the test database:
```bash
# PowerShell example
$env:DATABASE_URL="postgresql://app:apppass@localhost:5432/jwt_practice_test?schema=public"
npx prisma migrate dev
```

Run Tests
```bash
npm test
```