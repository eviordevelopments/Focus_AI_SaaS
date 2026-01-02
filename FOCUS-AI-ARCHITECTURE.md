# FOCUS AI – Architecture (MVP)

## 1. High-Level Diagram (Text)

- Electron shell
  - Loads React SPA at `http://localhost:3000` in production bundle.
- React + TypeScript front-end
  - UI, routing, state management.
- Node.js backend (Express)
  - API server for tasks, sessions, health, learning, AI proxy.
- PostgreSQL database
  - Stores users, tasks, sessions, health metrics, cards.
- Optional: Python microservice (later) for more advanced analytics.

---

## 2. Tech Stack Choices (MVP)

- Desktop Shell: **Electron** [web:186][web:189]
- Frontend:
  - React 18 + TypeScript
  - React Router for navigation
  - TailwindCSS for glassmorphic UI
- State:
  - Redux Toolkit for global state (user, tasks, health, sessions)
  - React Query (optional) for server state
- Backend:
  - Node.js + Express
  - REST-only for MVP (no WebSockets required now)
- DB:
  - PostgreSQL
  - Knex/Prisma (choose one, Prisma recommended)
- AI:
  - OpenAI API (via backend endpoint)

---

## 3. Core Data Models (Simplified)

### User
- `id` (uuid)
- `email`
- `name`
- `created_at`

### LifeArea
- `id`
- `user_id`
- `name` (Work, Study, Health, Finance, Personal)

### Task
- `id`
- `user_id`
- `area_id`
- `title`
- `description`
- `status` (todo, in_progress, done)
- `priority` (1–5)
- `due_date`
- `created_at`
- `completed_at`

### Session
- `id`
- `user_id`
- `task_id` (nullable)
- `type` (pomodoro, deepwork, custom)
- `start_time`
- `end_time`
- `planned_minutes`
- `focus_quality`
- `distractions`
- `notes`

### HealthEntry
- `id`
- `user_id`
- `date`
- `sleep_hours`
- `mood`
- `stress`
- `screen_time_hours`
- `exercise_minutes`
- `burnout_score` (stored for quick reads)

### Deck (LearningItem)
- `id`
- `user_id`
- `title`

### Card
- `id`
- `deck_id`
- `front`
- `back`
- `ease_factor`
- `interval_days`
- `repetitions`
- `last_review`
- `next_review`

---

## 4. API Endpoints (MVP Set)

Base: `/api`

### Auth (simple for MVP)
- `POST /api/auth/login` – local password or token.
- `POST /api/auth/logout`

### Tasks
- `GET /api/tasks` – list with filters (area, status, date).
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Sessions
- `POST /api/sessions/start`
- `POST /api/sessions/:id/finish`
- `GET /api/sessions/recent`

### Health
- `POST /api/health/daily` – log or update today’s entry.
- `GET /api/health/today`
- `GET /api/health/burnout` – returns latest burnout score + explanation.

### Learning
- `GET /api/decks`
- `POST /api/decks`
- `GET /api/decks/:id/cards?due=today`
- `POST /api/cards`
- `POST /api/cards/:id/review` – quality 0–5, SM-2 update.

### Focus AI Agent
- `POST /api/agent/chat`
  - Body: `{ message: string }`
  - Backend:
    - Fetch recent user context.
    - Build prompt.
    - Proxy to OpenAI.
    - Return `{ reply: string }`.

---

## 5. Electron Shell

- `main.js`:
  - Create BrowserWindow.
  - Load index.html (React build).
  - Handle app lifecycle.
- Use `electron-builder` to package apps for macOS (.dmg) and Windows (.exe) [web:186][web:193].
