# CONTRACT.md — Unplug (Main Challenge)

Shared source of truth. Build direction: **Option A — Screen Time Reset**
(chosen for least moving parts / cleanest AI story under time pressure).

---

## 1. Problem Restatement

> Challenge: Breaking Bad Habits & Addiction — Build a GenAI-powered
> solution (web application) that helps users reduce or overcome harmful
> habits such as excessive screen time or addictions. The solution must
> leverage Generative AI as a core component to deliver intelligent
> nudges, personalized tracking, adaptive coaching, and support mechanisms
> that encourage sustained behavior change.

In our own words: the user sets one screen-time-related habit they want to
reset (e.g. "late-night scrolling," "checking phone during work"). Each
day they check in with their real screen time and what triggered it.
Gemini reads that entry plus their real recent history and generates a
personalized daily coaching message and a short nudge plan — concrete
alternative actions tailored to their actual trigger pattern, not generic
advice. Progress (trend, streak) is computed live from real check-ins.
Tone is supportive and non-shaming throughout — nudges, not guilt — and
the app makes no clinical/diagnostic claims.

## 2. Hero Feature (must never fail live)

**Adaptive Daily Coaching.** User submits today's check-in (screen time +
trigger note) → backend sends it plus the user's real recent history to
Gemini → Gemini returns a coaching message and nudge plan that visibly
differ depending on the user's actual logged pattern (e.g. references
"you're down 20 minutes from yesterday" or "this is the third night you've
mentioned scrolling before bed — try X"). If Gemini fails, the check-in
still saves and the UI shows an honest "coaching unavailable" state —
never a fabricated response.

## 3. Final API Contract

Base path: `/api`. Every request carries header `X-Session-Id: <uuid>`
(frontend generates one UUID on first load, persists in `localStorage`).
No login/auth — anonymous per-browser session so any evaluator can use
every feature with zero friction. One active goal per session (kept
intentionally to a single habit — not multi-habit CRUD — to minimize
surface area).

### `POST /api/goal` (create or update — upsert by session)
Request: `{ habitLabel: string (1-100 chars), dailyTargetMinutes?: int > 0 }`
Response `200`: `{ id, sessionId, habitLabel, dailyTargetMinutes, createdAt }`
Errors: `400` validation

### `GET /api/goal`
Response `200`: goal object, or `404` if session has no goal yet (frontend
routes to setup screen on 404)

### `POST /api/checkins` — **hero endpoint, real Gemini call**
Upsert-by-day: if today's check-in already exists for this session, it is
corrected/replaced (re-triggers a fresh Gemini call).
Request:
```
{
  screenTimeMinutes: int >= 0,
  triggerNote?: string (<=280),
  moodContext?: "STRESSED" | "BORED" | "HABIT" | "SOCIAL" | "OTHER"
}
```
Response `201`:
```
{
  checkIn: { id, date, screenTimeMinutes, triggerNote, moodContext, createdAt },
  coaching: { status: "SUCCESS", dailyMessage, nudgePlan: string[] (1-3 items) }
           | { status: "UNAVAILABLE" }
}
```
Errors: `400` validation, `404` no goal set yet, `429` rate limited,
`500` DB failure (generic message to client, real error logged server-side)

### `GET /api/checkins?limit=&cursor=`
Response `200`: `{ checkIns: [{ ...checkIn, coaching }], nextCursor: string|null }`
Default `limit=14`, max `50`, cursor-based on `date` descending.

### `GET /api/stats`
Response `200`:
```
{
  totalCheckIns: int,
  currentStreakDays: int,          // consecutive days with a check-in, up to today
  avgMinutesLast7Days: number|null,
  avgMinutesPrev7Days: number|null,
  trend: "IMPROVING" | "WORSENING" | "STEADY" | "NOT_ENOUGH_DATA",
  daysUnderTargetLast7: int|null   // null if no dailyTargetMinutes set
}
```
All values computed live from real `CheckIn` rows.

## 4. Final Data Model (Prisma / SQLite)

```prisma
model Goal {
  id                 String   @id @default(cuid())
  sessionId          String   @unique
  habitLabel         String
  dailyTargetMinutes Int?
  createdAt          DateTime @default(now())
}

model CheckIn {
  id                String    @id @default(cuid())
  sessionId         String
  date              String    // "YYYY-MM-DD", unique per (sessionId, date)
  screenTimeMinutes Int
  triggerNote       String?
  moodContext       String?   // STRESSED | BORED | HABIT | SOCIAL | OTHER
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  coaching          CoachingResponse?

  @@unique([sessionId, date])
  @@index([sessionId, date])
}

model CoachingResponse {
  id         String   @id @default(cuid())
  checkInId  String   @unique
  checkIn    CheckIn  @relation(fields: [checkInId], references: [id])
  status     String   // SUCCESS | UNAVAILABLE
  dailyMessage String?
  nudgePlan  String?  // JSON-encoded string[]
  createdAt  DateTime @default(now())
}
```

## 5. Tech Stack

- Frontend: React (Vite) + Tailwind CSS + Axios
- Backend: Node.js + Express.js — serves the built React static files itself
  in production (single deployable service, no cross-origin config needed).
  In local dev, client and server still run as two processes with a Vite
  proxy, for fast iteration.
- Database: **Postgres (hosted on Neon, free tier)** via Prisma ORM — not
  SQLite, because free hosting tiers have ephemeral filesystems and a
  SQLite file would be wiped on every redeploy/restart, risking a "deployed
  link stops working" disqualification.
- AI: Google Gemini API (`GEMINI_API_KEY` already provisioned/verified from warm-up)
- Deploy: single combined service → Render (one deploy, one set of env vars)

## 6. Anticipated Failure Modes

| Failure | Handling |
|---|---|
| Gemini call fails / times out | Retry once (short backoff), then persist check-in with `coaching.status = "UNAVAILABLE"`. Never fabricate a message. |
| Gemini returns malformed/non-JSON output | Validate against strict schema; one re-prompt with stricter instructions; then `UNAVAILABLE`. |
| Empty/invalid input | `400` with field-level validation errors, client + server side. |
| Duplicate check-in same day | Treated as an intentional correction (upsert), not an error — re-runs coaching on the corrected data. |
| Rapid double-submit | Frontend disables submit while pending; backend rate-limits `POST /checkins` to 20/15min per session. |
| DB write failure | `500` generic safe message to client; full error logged server-side only. |
| Network drop mid-demo | Frontend shows explicit error state with retry button; no silent hang. |

## 7. Definition of Done (evaluator checklist)

1. First-time user can set a goal (habit label, optional daily target minutes) — no login required
2. User can submit a daily check-in (screen time + trigger note + mood) and receive a real, non-canned Gemini coaching message + nudge plan tied to that entry
3. Coaching visibly adapts to real logged history (verified by checking in 2+ days with different patterns and confirming the message differs meaningfully)
4. Check-in history and past coaching responses are persisted and viewable — not regenerated/faked on reload
5. Dashboard shows real computed stats: streak, 7-day average trend, days under target — derived from actual check-ins only
6. If Gemini fails, the app shows an honest "coaching unavailable" state and still saves the check-in — verified by simulated failure, not assumed
7. Every async action has an explicit loading state and explicit error state
8. Tone is supportive/non-shaming throughout; no clinical/diagnostic claims anywhere in copy
9. Security: helmet headers, CORS locked to client origin, rate limit on the AI endpoint, no raw stack trace ever reaches the client, all free-text input sanitized before DOM render
10. Accessibility: labeled form inputs, visible focus states, `aria-live` on loading/error/coaching regions, WCAG AA contrast
11. Tests pass: unit (validation + Gemini response parser), integration (POST endpoints happy + failure path), one full end-to-end demo script
12. App is deployed and reachable at a public URL; the full flow works against the deployed instance, not just localhost
13. README documents exact run/test commands and a step-by-step "how an evaluator verifies this works" section
