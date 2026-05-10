# Sweet Science Systems Backend

Node/Express backend for the frontend in ../frontend with Supabase persistence.

## Features Implemented

- JWT authentication
- Fighter CRUD
- Goal CRUD + progress and status calculation
- Attendance logging + discipline summary
- Readiness score calculation
- AI coach assistant via Groq API with rule-based fallback
- Fighter report generation + persistence

## 1) Setup

1. Copy .env.example to .env
2. Fill in Supabase and JWT values
3. Run the SQL in sql/schema.sql inside Supabase SQL editor
4. Install dependencies:

```bash
cd backend
npm install
```

5. Run API server:

```bash
npm run dev
```

Server defaults to http://localhost:4000.

## 2) Frontend + Backend Together

Because app.js serves ../frontend statically, opening http://localhost:4000 will load the frontend and route /api/* requests to this backend.

## 3) Environment Variables

- PORT: API port (default 4000)
- JWT_SECRET: used to sign JWTs
- SUPABASE_URL: your Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: service role key (server-side only)
- GROQ_API_KEY: optional, enables AI responses
- GROQ_MODEL: optional, default llama-3.1-8b-instant

## 4) API Endpoints

### Auth

- POST /api/auth/register
- POST /api/auth/login

### Fighters

- POST /api/fighters
- GET /api/fighters
- GET /api/fighters/:id
- PUT /api/fighters/:id
- DELETE /api/fighters/:id
- GET /api/fighters/:id/history

### Goals

- POST /api/goals
- GET /api/goals
- GET /api/goals/:fighter_id
- PUT /api/goals/:id

### Attendance

- POST /api/attendance
- POST /api/attendance/single
- GET /api/attendance/:fighter_id
- GET /api/attendance/:fighter_id/summary

### AI Coach

- POST /api/ai/coach-feedback

### Reports

- POST /api/reports/generate
- GET /api/reports/:fighter_id
