# FOCUS AI – MVP Scope & Requirements

## 1. User Stories (MVP)

### 1.1 Life Areas & Tasks
- As a user, I can define and view **life areas** (Work, Study, Health, Finance, Personal) and see all my tasks organized by area.
- As a user, I can **create, edit, complete, and delete** tasks with fields:
  - title, description, area, status, priority (1–5), due date.
- As a user, I can filter tasks by:
  - area, status, due date (Today, This Week), and priority.

### 1.2 Deep Work Studio
- As a user, I can start a **focus session** with:
  - type: Pomodoro (25/5), Deep Work (50), Custom (user minutes).
  - optional linked task.
- As a user, I perform a **pre-session check-in**:
  - mood (1–10), energy (1–10).
- As a user, I perform a **post-session review**:
  - focus quality (1–10), distractions count, notes.
- As a user, I can see my **last 10 sessions** and basic stats.

### 1.3 Health & Burnout
- As a user, I can log a **daily health check**:
  - sleep hours, mood (1–10), stress (1–10), screen time hours, exercise minutes.
- As a user, I see a **burnout score 0–100** and a label:
  - Healthy, Caution, Warning, Critical.
- As a user, I see basic explanation (top 3 factors) and 1 suggestion.

### 1.4 Learning / Spaced Repetition
- As a user, I can create **decks** (Learning Items) with flashcards.
- As a user, I can review cards due “Today”.
- As a user, after seeing a card, I rate recall quality 0–5 and next review is scheduled using SM-2 (interval, ease factor) [web:191][web:194].

### 1.5 Focus AI Agent (v0)
- As a user, I can ask a question in a chat UI.
- The agent replies in 2–3 sentences using:
  - latest burnout score, today’s health entry, last 5 tasks, last 3 sessions.
- If burnout is Critical/Warning, the agent emphasizes rest over doing more [web:192][web:195].

---

## 2. Non-Functional Requirements

- **Performance**
  - App loads dashboard < 2 seconds on mid-level laptop.
  - Timer tick is smooth (no visible lag).
- **Reliability**
  - No data loss after app restart.
  - Automatic local cache synced to backend.
- **Security (MVP)**
  - Single-user local desktop: basic password or OS account assumed.
  - API keys stored securely in environment or encrypted store.
- **Localization**
  - Spanish-first copy; English next. (MVP Spanish, constants in code.)

---

## 3. In-Scope vs Out-of-Scope (MVP)

### In-Scope
- Single-user account per desktop app.
- Online sync (if backend is enabled).
- Desktop packaging for macOS and Windows.
- Core analytics dashboard (simple charts for sessions, tasks, burnout).

### Out-of-Scope (Future)
- Multi-team collaboration.
- Mobile apps (native).
- External calendar syncing.
- Banking/finance integrations.
- Advanced adaptive ML models (beyond simple rules).
