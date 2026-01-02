# FOCUS AI – Executive Summary (MVP)

## Vision
FOCUS AI is a **second brain** desktop app that unifies projects, systems, habits, and health into a single, adaptive platform. It uses **neuroscience** and **AI** to personalize deep work sessions, track mental health indicators, and optimize productivity and learning.

## Core Promise (MVP)
- One **all-in-one** system: tasks, projects, life areas, habits, health.
- **Adaptive focus**: smart Pomodoro/deep work sessions tailored to your energy.
- **Burnout radar**: simple daily check-ins that compute a burnout risk score.
- **Learning brain**: basic spaced repetition + active recall for study and skills.
- **Martin/Focus AI agent**: contextual helper for planning and reflection.

## Target User (for MVP)
- Individual knowledge workers, students, and creatives in MX/AR.
- Heavy cognitive load: 3+ parallel projects or roles.
- Already using Notion/Todoist/Google Calendar but feel fragmented and overwhelmed.

## Platforms (MVP)
- **Desktop app** (Electron) with embedded **React + TypeScript** SPA.
- Single user per device, multi-account ready (no team collaboration yet).
- Online-first (requires internet), local cache for resilience.

## MVP Feature Set (Must-Haves)
1. **Life Areas OS**
   - Predefined areas: Work, Study, Health, Finance, Personal.
   - Tasks linked to areas and optional goals.

2. **Task & Project Manager**
   - Task CRUD (title, description, status, due date, priority, area).
   - Simple Kanban: Todo, In Progress, Done.
   - Today / This Week views.

3. **Deep Work Studio**
   - Timer modes: Pomodoro, Deep Work (long), Custom.
   - Pre-session check-in: mood, energy.
   - Post-session review: focus quality, notes.
   - Session log stored per user.

4. **Health & Burnout Tracking (simple but real)**
   - Daily form: sleep hours, mood, stress 1–10, screen time, exercise minutes.
   - Burnout score 0–100 computed from last 7 days [web:192][web:195].

5. **Learning / Spaced Repetition (SM-2 core)**
   - Flashcards: front/back.
   - SM-2 algorithm for next review date (interval, ease factor) [web:191][web:194].

6. **Focus AI Agent (v0)**
   - Chat interface.
   - Uses OpenAI API with system prompt + latest:
     - burnout score, today’s health metrics, last 5 tasks, last 3 sessions.

## Design Principles
- **Apple-style glassmorphism**: translucent cards, soft shadows, gradients.
- **Minimal, calm UI**: low noise, no clutter, high readability.
- **Fast interactions**: click → action < 100ms, initial load < 2s.

## Business (MVP)
- Goal of MVP: validate **engagement** and **burnout feature** value.
- Monetization can be post-MVP; focus now on retention and NPS.
