# Migrate from Supabase/PostgreSQL to MongoDB with Authentication & Seed Fighter Data

## Background

The Sweet Science Systems backend currently uses **Supabase (PostgreSQL)** via `@supabase/supabase-js` across all 6 route files, 4 service files, and 1 config file. The goal is to replace every Supabase call with **MongoDB** using `mongoose`, apply **MongoDB authentication**, and seed the database with realistic fighter data.

## Proposed Changes

### 1. Config Layer

#### [MODIFY] [.env](file:///d:/Projects/Web-Tech-ESP/backend/.env)
- Remove `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Add `MONGO_URI=mongodb://admin:sweetscience2026@localhost:27017/sweet_science?authSource=admin`
  - This URI includes MongoDB authentication credentials (username: `admin`, password: `sweetscience2026`)

#### [MODIFY] [env.js](file:///d:/Projects/Web-Tech-ESP/backend/src/config/env.js)
- Replace Supabase env validation with `MONGO_URI` validation
- Export `MONGO_URI` instead of Supabase keys

#### [DELETE] [supabase.js](file:///d:/Projects/Web-Tech-ESP/backend/src/config/supabase.js)
- Remove Supabase client entirely

#### [NEW] [db.js](file:///d:/Projects/Web-Tech-ESP/backend/src/config/db.js)
- Create Mongoose connection with authentication options
- Export `connectDB()` function used in `server.js`

---

### 2. Mongoose Models

#### [NEW] [models/User.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/User.js)
- Fields: `name`, `email` (unique), `password_hash`, `gym_name`, `created_at`

#### [NEW] [models/Fighter.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/Fighter.js)
- Fields: `coach_id` (ref → User), `name`, `weight`, `weight_lbs`, `weight_class`, `cardio` (1-5), `striking` (1-5), `grappling` (1-5), `training_frequency`, `sessions_per_week`, `training_since`, `created_at`, `updated_at`

#### [NEW] [models/Goal.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/Goal.js)
- Fields: `coach_id`, `fighter_id` (ref → Fighter), `type` (enum), `description`, `target_value`, `current_value`, `deadline`, timestamps

#### [NEW] [models/Attendance.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/Attendance.js)
- Fields: `coach_id`, `fighter_id`, `session_date`, `attended`, `status` (enum), `note`, `created_at`
- Unique compound index on `(fighter_id, session_date)`

#### [NEW] [models/Report.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/Report.js)
- Fields: `coach_id`, `fighter_id`, `report_text`, `ai_source`, `created_at`

#### [NEW] [models/FighterHistory.js](file:///d:/Projects/Web-Tech-ESP/backend/src/models/FighterHistory.js)
- Fields: `fighter_id`, `field_name`, `old_value`, `new_value`, `note`, `logged_at`

---

### 3. Route Files — Supabase → Mongoose

#### [MODIFY] [auth.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/auth.js)
- Replace `supabase.from('users')` calls with `User.findOne()`, `User.create()`, etc.

#### [MODIFY] [fighters.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/fighters.js)
- Replace all Supabase queries with `Fighter.find()`, `Fighter.findOne()`, `Fighter.create()`, `Fighter.findByIdAndUpdate()`, `Fighter.findByIdAndDelete()`
- Replace `supabase.from('fighter_history')` with `FighterHistory.create()`
- Update `enrichFighter()` calls to no longer pass `supabase` as first argument

#### [MODIFY] [goals.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/goals.js)
- Replace Supabase queries with `Goal.find()`, `Goal.create()`, `Goal.findOneAndUpdate()`
- Fighter ownership verification via `Fighter.findOne()`

#### [MODIFY] [attendance.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/attendance.js)
- Replace Supabase upsert with `Attendance.findOneAndUpdate({ upsert: true })`
- Replace Supabase selects with `Attendance.find()`

#### [MODIFY] [reports.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/reports.js)
- Replace Supabase queries with `Report.create()`, `Report.find()`
- Update `enrichFighter()` / `getAttendanceStats()` calls

#### [MODIFY] [ai.js](file:///d:/Projects/Web-Tech-ESP/backend/src/routes/ai.js)
- Replace Supabase fighter/goal queries with Mongoose equivalents

---

### 4. Services — Remove Supabase Dependency

#### [MODIFY] [fighterMetrics.js](file:///d:/Projects/Web-Tech-ESP/backend/src/services/fighterMetrics.js)
- Change `getAttendanceStats(supabase, fighterId)` → `getAttendanceStats(fighterId)` (import Attendance model directly)
- Change `enrichFighter(supabase, fighter)` → `enrichFighter(fighter)`

#### No changes needed for [scoring.js](file:///d:/Projects/Web-Tech-ESP/backend/src/services/scoring.js), [reportBuilder.js](file:///d:/Projects/Web-Tech-ESP/backend/src/services/reportBuilder.js), or [aiCoach.js](file:///d:/Projects/Web-Tech-ESP/backend/src/services/aiCoach.js) (no Supabase usage)

---

### 5. Server Entry Point

#### [MODIFY] [server.js](file:///d:/Projects/Web-Tech-ESP/backend/src/server.js)
- Call `connectDB()` before `app.listen()` — server starts only after MongoDB connection succeeds

---

### 6. Seed Script with Fighter Data

#### [NEW] [seed.js](file:///d:/Projects/Web-Tech-ESP/backend/src/seed.js)
- Creates a demo coach user (email: `coach@sweetscience.com`, password: `coach123`)
- Seeds **10 realistic fighters** with varied stats:

| Fighter | Weight (lbs) | Class | Cardio | Striking | Grappling | Sessions/wk |
|---|---|---|---|---|---|---|
| Khabib Nurmagomedov | 155 | Lightweight | 5 | 3 | 5 | 6 |
| Conor McGregor | 155 | Lightweight | 3 | 5 | 2 | 4 |
| Israel Adesanya | 185 | Middleweight | 4 | 5 | 3 | 5 |
| Amanda Nunes | 135 | Bantamweight | 5 | 5 | 4 | 6 |
| Jon Jones | 248 | Heavyweight | 4 | 4 | 5 | 5 |
| Max Holloway | 145 | Featherweight | 5 | 5 | 3 | 6 |
| Charles Oliveira | 155 | Lightweight | 4 | 4 | 5 | 5 |
| Valentina Shevchenko | 125 | Flyweight | 5 | 4 | 4 | 5 |
| Alexander Volkanovski | 145 | Featherweight | 5 | 4 | 4 | 6 |
| Kamaru Usman | 170 | Welterweight | 5 | 4 | 4 | 5 |

- Also seeds sample goals, attendance records, and fighter history for each fighter

---

### 7. Dependencies

#### [MODIFY] [package.json](file:///d:/Projects/Web-Tech-ESP/backend/package.json)
- **Add**: `mongoose` 
- **Remove**: `@supabase/supabase-js`

---

## MongoDB Authentication Setup

> [!IMPORTANT]
> **You need MongoDB running locally with authentication enabled.** The seed script and app will connect using:
> ```
> mongodb://admin:sweetscience2026@localhost:27017/sweet_science?authSource=admin
> ```
> 
> If you already have MongoDB running without auth, or want to use a cloud MongoDB Atlas instance instead, let me know and I'll adjust the URI accordingly.

## Open Questions

> [!IMPORTANT]
> 1. **Do you already have MongoDB installed locally?** If not, I can guide you through the setup, or we can use MongoDB Atlas (free tier cloud).
> 2. **Do you want to keep Supabase as a fallback**, or fully remove it?
> 3. **Should the seed fighters be from a specific discipline** (e.g., MMA only, or also boxing/Muay Thai)?

## Verification Plan

### Automated Tests
1. Run `npm install` to verify new dependencies
2. Run `node src/seed.js` to seed the database
3. Run `npm run dev` and test:
   - `POST /api/auth/login` with `coach@sweetscience.com` / `coach123`
   - `GET /api/fighters` (should return 10 seeded fighters)
   - `GET /api/health` (should return `{ ok: true }`)
4. Verify MongoDB authentication by testing with wrong credentials (should fail to connect)
