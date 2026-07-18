# Unplug — Adaptive Screen-Time Reset Coach

**Live app:** https://unplug-etso.onrender.com

Built for the PromptWars "Breaking Bad Habits & Addiction" challenge.
Unplug helps someone reset a screen-time habit (e.g. late-night
scrolling, phone checking during work) through daily check-ins that get a
real, personalized coaching response from Google Gemini — not a canned
message. No login required; each browser gets its own anonymous session.

## Which Generative AI service is used, and where

**Google Gemini** (`gemini-3.5-flash`, `@google/generative-ai` SDK),
called from `server/services/geminiService.js`, triggered by
`POST /api/checkins` (see `CONTRACT.md`). Every check-in sends Gemini the
user's real recent history (screen time, triggers, mood) and asks for a
personalized daily coaching message + a 1–3 item nudge plan — the message
genuinely changes based on the user's actual logged pattern. If Gemini
fails after one retry, the check-in still saves and the UI shows an
honest "coaching unavailable" state; nothing is ever fabricated.

## Tech stack

- Frontend: React (Vite) + Tailwind CSS + Axios
- Backend: Node.js + Express — also serves the built React app directly,
  so this is one combined deployable service, not two
- Database: Postgres (hosted on Neon) via Prisma ORM
- Deploy: Render (single Web Service, root of this repo)

## Local setup

```bash
npm run install:all                 # installs root + server + client deps

# server/.env — copy from server/.env.example and fill in:
#   DATABASE_URL   postgres connection string (e.g. a free Neon project)
#   GEMINI_API_KEY your Gemini API key
cp server/.env.example server/.env

cd server && npx prisma db push && cd ..   # creates the schema in your DB

npm run dev                          # server on :5002, client on :5174
```

Open http://localhost:5174.

## Running tests

```bash
npm test              # server (Jest/Supertest) + client (Vitest) suites
npm run test:server   # 22 tests: unit, integration, and one full e2e
                       # demo-flow test against a real Postgres DB
npm run test:client   # 7 component tests
```

## How an evaluator verifies this actually works

1. Open the live link above. No login — you land straight on goal setup.
2. Enter anything for "What do you want to reset?" (e.g. "Late-night
   scrolling") and an optional daily target in minutes, then submit.
3. On the dashboard, submit a check-in: screen time in minutes, an
   optional trigger note, an optional mood. Submit.
4. A coaching card appears with a real Gemini-generated message and a
   short nudge plan — read it; it references your actual input, not a
   generic template.
5. Submit a second check-in with a different pattern (e.g. much lower
   screen time, a different trigger). The next coaching message will
   visibly reference the change — this is the "adaptive" part working
   for real, not a fixed script.
6. Scroll down: "Your progress" shows a real computed streak and 7-day
   trend, and "History" shows both past check-ins persisted in the
   database.
7. To see the honest failure path: there is no user-facing way to break
   the AI call on purpose, but it's covered by an automated test
   (`server/tests/checkins.test.js`, "failure path") that confirms a
   failed Gemini call still saves the check-in and returns an
   `UNAVAILABLE` coaching status rather than fabricating a response.

No test credentials needed — there is no authentication; each browser is
identified by a random session ID stored in `localStorage`.
