# Sweet Science Systems

This workspace now contains:

- frontend/: your existing frontend pages
- backend/: complete Node/Express/Supabase backend for the PRD

## Quick Start

1. Set up database tables in Supabase with backend/sql/schema.sql.
2. Configure backend/.env from backend/.env.example.
3. Start backend:

```bash
cd backend
npm install
npm run dev
```

4. Open http://localhost:4000

The backend serves frontend files and exposes all API routes under /api.
