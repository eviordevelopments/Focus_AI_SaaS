# FOCUS AI – Build Tasks (MVP)

## Sprint 1 – Foundation (Week 1)

1. Repo & Tooling
   - Initialize monorepo or 2 repos (`app-desktop`, `api`).
   - Setup ESLint + Prettier.
   - Setup basic CI (lint + build).

2. Electron + React Skeleton
   - Electron main process with a single window.
   - React app rendered in the window.
   - Dev mode: React dev server; Prod mode: built bundle.

3. Backend Skeleton
   - Express server with `/health` endpoint.
   - PostgreSQL connection.
   - Migration tool (Prisma or Knex) configured.

4. Base UI Shell
   - Sidebar with nav: Dashboard, Areas, Deep Work, Health, Learning, Agent.
   - Top bar with date and user placeholder.
   - Glassmorphic card component.

---

## Sprint 2 – Tasks & Areas (Week 2)

1. DB: Migrations for User, LifeArea, Task.
2. API: `/api/tasks` CRUD + filter.
3. Frontend:
   - LifeArea selector.
   - Task list with filters.
   - Task form (modal or inline).
4. UX:
   - Kanban view: Todo / In Progress / Done.
   - Drag-and-drop can be skipped for MVP; use buttons to move status.

---

## Sprint 3 – Deep Work Studio (Week 3)

1. DB: Migrations for Session.
2. API:
   - `POST /api/sessions/start`
   - `POST /api/sessions/:id/finish`
   - `GET /api/sessions/recent`
3. Frontend:
   - Timer component with:
     - Start, Pause, Reset.
     - Pre-session mood/energy slider.
     - Post-session focus/distractions.
4. UX:
   - Card showing today’s total focus time.
   - Last 5 sessions list.

---

## Sprint 4 – Health & Burnout (Week 4)

1. DB: Migration for HealthEntry.
2. Backend:
   - `POST /api/health/daily`
   - `GET /api/health/today`
   - `GET /api/health/burnout`
   - Implement burnout algorithm using last 7 entries:
     - Weights: low sleep, high stress, low mood, no exercise [web:192][web:195].
3. Frontend:
   - Health page with daily form.
   - Burnout gauge (0–100) and colored label.
   - List last 7 days as simple chart.

---

## Sprint 5 – Learning & Spaced Repetition (Week 5)

1. DB: Migrations for Deck and Card.
2. Backend:
   - `GET /api/decks`, `POST /api/decks`.
   - `GET /api/decks/:id/cards?due=today`.
   - `POST /api/cards`, `POST /api/cards/:id/review`.
   - Implement SM-2 updates [web:191][web:194].
3. Frontend:
   - Learning page:
     - Deck list.
     - Add card form.
     - Review session: show card front → show back → choose quality 0–5.

---

## Sprint 6 – Focus AI Agent v0 (Week 6)

1. Backend:
   - `POST /api/agent/chat`:
     - Accept `message`.
     - Fetch context: burnout, last health, recent tasks, recent sessions.
     - Create system prompt with clear rules.
     - Call OpenAI and return reply.
2. Frontend:
   - Chat page:
     - Bubbles for user and AI.
     - Input box + send button.
   - Typing indicator.

---

## Sprint 7 – Polish & Packaging (Week 7)

1. UX Polish:
   - Consistent spacing, colors, typography.
   - Glassmorphic cards for all main blocks.
2. Bug fixing and error states:
   - Empty states (no tasks, no sessions).
   - Loading indicators.
   - Toaster for errors.
3. Packaging:
   - Electron builder config.
   - Generate macOS and Windows installers.

---

## MVP DONE Criteria

- All 5 pillars (Tasks, Deep Work, Health, Learning, Agent) working end-to-end.
- App can be installed and used offline-first with sync when online.
- No crashes in core flows:
  - create task → start session → log health → review card → chat AI.
