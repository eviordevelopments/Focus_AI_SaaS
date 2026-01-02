# FOCUS AI – Modes, Neuroscience & Metrics (MVP)

## 1. Modes

### 1.1 Focus Modes
- Pomodoro:
  - 25 minutes focus, 5 minutes break (configurable later).
- Deep Work:
  - 50 minutes focus, 10 minutes break.
- Custom:
  - User-defined minutes (15–180).

Each focus session logs:
- planned_minutes, actual_minutes, focus_quality, distractions.

### 1.2 Life Areas
- Default areas:
  - Work, Study, Health, Finance, Personal.
- Each task must belong to one area.

### 1.3 Learning Mode
- Review session:
  - Show only cards with `next_review <= today`.
  - Stop after 20 cards or when no more due.

---

## 2. Neuroscience-Based Indicators

### 2.1 Burnout Score (0–100)

Inputs (last 7 days) [web:192][web:195]:
- Low sleep (< 6h)
- High stress (>= 7/10)
- Low mood (<= 4/10)
- No exercise (0 mins)
- Excess screen time (> 10h)

Simple scoring:
- +20 for frequent low sleep.
- +20 for frequent high stress.
- +15 for no exercise.
- +15 for high screen time.
- +20 for low mood.
- Cap at 100.

Levels:
- 0–24: Healthy
- 25–49: Caution
- 50–74: Warning
- 75–100: Critical

### 2.2 Focus Quality Index
- Average focus_quality of last 10 sessions.
- Show as 1–10 on dashboard.

### 2.3 Learning Retention Proxy
- For each deck:
  - Retention = % of cards with `quality >= 3` at last review.

---

## 3. Productivity & Mental Health Metrics (MVP)

Tracked daily:
- Tasks completed.
- Total focus minutes.
- Burnout score.
- Health entry presence (did user log today?).

Tracked weekly:
- Average burnout score.
- Average sleep hours.
- Total review cards done.

---

## 4. Dashboards (MVP)

### 4.1 Main Dashboard
- Today:
  - Completed tasks count.
  - Focus minutes.
  - Burnout gauge with label.
- This week:
  - Focus minutes bar.
  - Burnout trend (line).

### 4.2 Health Page
- Burnout gauge + list of top 3 contributing factors.
- 7-day view of sleep, mood, exercise.

### 4.3 Learning Page
- For each deck:
  - Cards due today.
  - Retention % (last 30 days).

---

## 5. Success Metrics (MVP Validation)

Behavioral:
- D1: 70% of users complete at least 1 focus session.
- D7: 40% still active.
- Weekly: 3+ sessions/user/week on average.

Perception:
- >60% of users say burnout score feels “mostly accurate”.
- >50% say Deep Work Studio helps them focus better.

Technical:
- <2s dashboard load.
- No data loss after crashes.
