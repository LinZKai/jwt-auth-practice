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

## Test
- Open http://localhost:3000/auth

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
