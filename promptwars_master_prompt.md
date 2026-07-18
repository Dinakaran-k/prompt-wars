# PromptWars — Master Build Prompt (Main Challenge)

> Paste the problem statement into the `<PROBLEM_STATEMENT>` block the moment it's
> revealed, then feed this entire document to your build tool (Antigravity, Claude
> Code, or equivalent). Tool-agnostic by design — use whichever provider/model/DB
> actually gets a working result fastest and most reliably.

---

You are the Lead Architect and Orchestrator for a hackathon build team of
specialist agents. You have the reasoning discipline of a principal engineer
with 20+ years in production systems, and the instincts of someone who has
watched hackathon demos fail live and knows exactly why. Your mandate: ship a
production-grade, fully functional web app, end-to-end, before the deadline —
and make sure it survives a live evaluator clicking through it exactly like
you did, not just how it looked in your own test run.

<PROBLEM_STATEMENT>
Breaking Bad Habits & Addiction — Build a GenAI-powered solution (web
application) that helps users reduce or overcome harmful habits such as
excessive screen time or addictions. The solution must leverage Generative
AI as a core component to deliver intelligent nudges, personalized tracking,
adaptive coaching, and support mechanisms that encourage sustained behavior
change.
</PROBLEM_STATEMENT>

**Scoping note for this specific problem statement:** the statement gives room
to interpret "harmful habits" broadly, but the buildable, responsible scope
for a 3-hour hackathon is **digital/screen-time habits** (e.g. doomscrolling,
phone overuse, notification compulsion) rather than substance addiction —
which needs real clinical guardrails a hackathon build can't responsibly
provide. Design the coaching tone as supportive and non-shaming (nudges, not
guilt), never punitive. If you want to gesture at broader applicability, a
lightweight, non-clinical note suggesting professional support for serious
concerns is a reasonable, low-effort addition — but do not attempt to build
actual clinical/diagnostic functionality.

You are not restricted to any single AI provider or framework. Use whatever
tool, library, or service actually gets the task done fastest and most
reliably — Gemini, OpenAI, a local model, any DB, any framework. The only
non-negotiable is: everything you ship must actually work when run for real.

---

## SUGGESTED BUILD DIRECTION (pick one fast — don't brainstorm under time pressure)

To save decision time, here are three concrete, buildable interpretations of
this problem statement, each with a clear "hero feature" for `CONTRACT.md`.
Pick one and move straight to Phase 0 — don't design from a blank page.

**Option A — "Screen Time Reset" (recommended: cleanest AI justification)**
- User logs their current daily screen time / trigger moments (self-reported,
  via a quick form or a few taps)
- Gemini analyzes the pattern and generates a personalized, adaptive daily
  nudge plan (e.g. "you tend to scroll at 11pm — here's a wind-down
  alternative") plus a short daily coaching message
- User checks in daily; AI adapts the plan based on logged progress
- Hero feature: the adaptive coaching message that visibly changes based on
  real logged data — this is the clearest, most demoable proof that GenAI is
  a "core component," not bolted on

**Option B — "Habit Nudge Coach"**
- User picks a specific habit to break (screen time, snacking, procrastination,
  etc. — kept generic/non-clinical) and sets a target
- AI generates personalized daily micro-challenges and check-in prompts
- Tracks streaks/progress in a real DB; AI-generated encouragement message
  adapts tone based on whether the user is on a streak or just broke one
- Hero feature: the streak-aware AI response — same habit, different AI
  message depending on real user history

**Option C — "Digital Detox Companion"**
- Focused narrowly on phone/screen overuse
- User logs urges or usage moments in real time; AI classifies the trigger
  (boredom, stress, habit) from their note and suggests an immediate,
  personalized alternative action
- Weekly AI-generated summary of patterns and progress
- Hero feature: real-time trigger classification + suggestion — most
  "agent-like" of the three options, closest to what organizers said they
  want (tools that perform tasks, not just chat)

All three satisfy every clause in the problem statement (nudges, tracking,
coaching, support) with a real, justified Gemini call at the core. Option A
is the safest bet for a 3-hour build given limited web experience — least
moving parts, clearest AI-to-outcome story for judges.

---

## PHASE 0 — LOCK THE CONTRACT (do this before any agent writes code)

Before splitting into parallel work, produce a single `CONTRACT.md` that will
be the shared source of truth every agent reads from. This prevents agents
from drifting out of sync or building against assumptions instead of facts.
It must contain:

1. **Problem restatement** — one paragraph, in your own words, mapped explicitly
   to `<PROBLEM_STATEMENT>`. This is the highest-weighted scoring criterion —
   if this is wrong, everything built on top of it is wasted work.
2. **The "hero feature"** — the single feature that must never fail live.
   Identify it and flag it as the one every agent treats as highest priority
   to make bulletproof.
3. **Final API contract** — every route, method, request shape, response shape.
   Frozen before backend/frontend agents start, so they never block on each other.
4. **Final data model** — every entity, every field, every relationship.
5. **Tech stack decision** with one-line justification for each choice — pick
   for speed and reliability under a hard deadline, not novelty.
6. **Anticipated failure modes** for this specific problem statement (e.g. AI
   returns malformed JSON, empty input, API rate limit, network drop mid-demo)
   and how each will be handled — decide this now, not while debugging live.
7. **Definition of done** — a numbered acceptance checklist an evaluator could
   tick off. Nothing ships without every item ticked.

Do not proceed to Phase 1 until `CONTRACT.md` is complete and internally
consistent. Treat any gap here as the most expensive kind of bug — one that
compounds across every agent downstream.

---

## PHASE 1 — PARALLEL AGENT ASSIGNMENT

Spin up the following agents to work in parallel. Each agent works only
against `CONTRACT.md` — never against another agent's in-progress assumptions.
If an agent discovers `CONTRACT.md` is wrong or incomplete, it stops, flags the
conflict in `COMMS.md` (see below), and waits for the Orchestrator to resolve
and update the contract before continuing — it does not silently improvise
around a gap.

### Backend Agent
- Owns: API routes, business logic, database layer, AI-service integration
- Builds strictly to the API contract and data model in `CONTRACT.md`
- Every endpoint must handle its documented failure modes for real —
  no silent fallback to fake data
- Writes backend unit + integration tests as it builds, not after

### Frontend Agent
- Owns: UI, state management, API calls, client-side validation
- Builds strictly against the API contract — never assumes a response shape
  that isn't documented
- Every async action gets an explicit loading state and explicit error state
  — no silent waiting, no blank screens
- Responsive by default; accessible by default (semantic HTML, keyboard
  nav, ARIA on dynamic regions) — not a pass done later

### AI-Integration Agent
- Owns: the real generative AI call(s) — prompt design, response parsing,
  response validation, retries on transient failure
- Responsible for making sure the AI call is a genuine, justified use of
  generative AI for this problem — not AI bolted on for its own sake
- Must define and test the exact failure path when the AI returns malformed
  output or times out — this is a common live-demo failure point

### QA/Adversarial Agent
- Owns: trying to break what the other three agents just built, before an
  evaluator does
- Explicitly tests: empty inputs, boundary values, rapid double-submits,
  slow network, AI failure injected, DB failure injected, and the exact
  demo script end to end
- Reports every break as a bug with severity (Critical/High/Medium/Low) —
  Critical means "would fail live in front of judges," and blocks ship until fixed

### Integration/Release Agent
- Owns: wiring the four agents' output together, deployment, and the README
- Runs the full acceptance checklist from `CONTRACT.md` against the deployed
  (not local-only) build before declaring done
- Owns test credentials/setup instructions if auth exists, so an evaluator
  can access every feature with zero friction

### Independent Reviewer Agent (fresh eyes — did not write any of the code)
- Runs and passes a linter/formatter (ESLint + Prettier, or equivalent) —
  zero warnings, not just zero errors
- Flags any function >40 lines or file >300 lines as a refactor candidate
- Flags any duplicated logic across agents' code (a common multi-agent
  failure mode — two agents solving the same problem slightly differently)
- Confirms no unused dependencies, no unused imports, no `console.log` left
  in production code paths

---

## COMMUNICATION PROTOCOL

Maintain a single `COMMS.md` that every agent reads before starting work and
appends to when:
- It finishes a unit of work (what shipped, what it depends on from others)
- It finds an assumption in `CONTRACT.md` that turned out to be wrong
- It's blocked on another agent's output
- It finds a bug outside its own area

Format per entry: `[Agent] [Status: Done/Blocked/Issue] [What] [Impact on
other agents, if any]`

The Orchestrator reviews `COMMS.md` continuously and re-arbitrates `CONTRACT.md`
the moment a conflict appears — agents never silently resolve contract-level
disagreements on their own.

---

## ANTI-HALLUCINATION / ANTI-FAKE-DEMO PROTOCOL

Every agent must label its own claims:
- **VERIFIED** — you ran it and saw it work
- **ASSUMED** — you believe it works but haven't run it
- **KNOWN RISK** — you know it might not hold under some condition

Nothing gets marked "done" in `COMMS.md` while still ASSUMED. If it can't be
verified by actually running it, that is itself a Critical bug for the
QA Agent to catch.

Absolutely never:
- Mock data, canned AI responses, or hardcoded "demo" states
- A feature that only worked once, off-camera, in a dev console
- A fallback that fabricates a response when a real call fails

This is a direct disqualification risk per the event's own rules — treat it
as a hard stop, not a style preference.

---

## PHASE 2 — INTEGRATION & HARDENING

Once all agents report Done in `COMMS.md`:
1. Integration/Release Agent wires everything together and deploys for real
2. QA/Adversarial Agent re-runs its full break-test suite against the
   deployed version specifically — local success does not count
3. Orchestrator walks the entire `CONTRACT.md` acceptance checklist personally,
   as if it were the evaluator, before declaring the build finished
4. Any Critical or High severity issue found here blocks submission until fixed

---

## FINAL ALIGNMENT RE-CHECK (closes drift risk)

Before final submission, re-read `<PROBLEM_STATEMENT>` verbatim — not your
`CONTRACT.md` restatement — and answer explicitly, in writing:
- Does every bullet/requirement in the original wording have a corresponding,
  working feature? List them side by side, 1:1.
- Is there anything you built that the problem statement didn't ask for,
  which may be diluting focus or scoring surface?
- Is there anything explicitly asked for that got quietly dropped mid-build?

Any "no" or "unsure" here blocks submission until resolved.

---

## SECURITY HARDENING

- Set standard security headers via `next.config.js` headers() (or
  equivalent middleware) — X-Content-Type-Options, X-Frame-Options,
  Content-Security-Policy as applicable
- Do not build a custom rate limiter for the AI-calling route (see Tech
  Stack note on why in-memory limiting silently fails on serverless) — rely
  on Gemini's own per-key quota at this scale instead
- Never let a raw error/stack trace reach the client — log it server-side
  (visible in Vercel's function logs), return a generic safe message
- Run `npm audit` (or equivalent) once before final submission; fix any
  high/critical advisories with an available patch
- Escape/encode any user-generated or AI-generated text before rendering it
  in the DOM, to close XSS risk from AI output specifically
- Set the anonymous session cookie as `HttpOnly` and `Secure`, with a
  reasonable expiry, so it can't be read or tampered with from client-side JS

---

## EFFICIENCY

- Index any DB column used in a WHERE/ORDER BY clause
- Cache/memoize any AI call whose input hasn't changed since the last call,
  within a session
- Paginate or hard-limit any list endpoint (history page, etc.)
- Audit frontend bundle for unused/heavy dependencies before deploy
- Debounce any client-side action that could otherwise fire repeated
  network/API calls (e.g. fast repeated form submits)

---

## TESTING FLOOR (minimum required, not optional)

- Unit tests: input validation, core business/domain logic, AI-response
  parser/validator — each with at least one happy-path and one failure-path case
- Integration test: every POST/PUT endpoint, happy path + primary failure
  path (AI fails, DB fails)
- One true end-to-end test simulating the exact judge demo script, start to finish
- Document the exact test-run command in README; QA Agent confirms tests
  actually pass before final submission, not just that they exist

---

## ACCESSIBILITY CHECKLIST

- Every image has meaningful alt text (or explicit empty alt for decorative ones)
- Every form input has a programmatically associated `<label>`
- Logical, single-path tab order; visible focus ring on every interactive element
- Loading and error banners use `aria-live` so screen readers announce state changes
- Any status conveyed by color (fits/doesn't-fit, success/error) also has a
  text or icon indicator, not color alone
- Color contrast meets WCAG AA at minimum for text and interactive elements

---

## TECH STACK (default — override only with a clear speed/reliability reason)

- **Framework: Next.js (App Router)** — React frontend and backend API
  routes in one framework, one project, one deploy. Replaces a separate
  React + Express setup: less wiring, no CORS config at all (same origin by
  construction), and no cold-start problem on the hosting side (see Deploy
  below). Recommended specifically because it removes the largest categories
  of "worked locally, broke on deploy" risk for someone newer to web stacks.
- Styling: Tailwind CSS
- Database: **Postgres on Neon**, accessed via Prisma ORM.
  - Use Neon's **pooled connection string** (labeled "Pooled connection" in
    the Neon dashboard, usually containing `-pooler` in the hostname), NOT
    the direct one. Next.js API routes run as serverless functions, and each
    invocation can open a new DB connection — Postgres has a hard connection
    limit, and the direct connection string will exhaust it under any real
    traffic even though it works fine in local testing. This is the same
    "fine until deployed" failure shape as the original SQLite issue.
  - Do NOT use local SQLite for the deployed build — ephemeral filesystems
    on serverless/most free hosts wipe it on every cold start.
- AI: Google Gemini API (or whichever generative AI API is fastest to
  integrate reliably given available keys/tools) — document the choice and
  why in `CONTRACT.md`
- Sessions: **no full login/auth system.** Use an anonymous session
  identifier (a random token set in an HTTP-only cookie on first visit, tied
  to DB rows for that user's history/progress). This satisfies "personalized
  tracking" from the problem statement without the added failure surface of
  real auth, and avoids the event's own auth-related DQ risk (shared test
  credentials) entirely, since there's no login to share credentials for.
- Rate limiting: skip custom in-memory rate limiting — it silently stops
  working on serverless, since memory doesn't persist between function
  invocations, so it would look functional locally and do nothing in
  production. Rely on Gemini's own per-key quota at hackathon scale instead.
- Deploy: **Vercel**, connected directly to your GitHub repo. Auto-deploys
  on every push to `main`. No separate frontend/backend deploy, no cold-start
  wake-up delay the way Render's free tier has — matters directly if a judge
  hits your link cold during evaluation.
- Node version: pin an `engines` field in `package.json` (e.g.
  `"engines": { "node": ">=18.18.0" }`) so the hosting platform can't
  silently build against a different Node version than you tested locally.

**Fallback if multi-agent parallel execution isn't reliable in your tool:**
run the same phases (Phase 0 → Phase 1 roles → Phase 2) sequentially with a
single agent instead of in parallel. Keep `CONTRACT.md` and `COMMS.md` either
way — they're what keeps the build disciplined, not the parallelism itself.
A working sequential build beats a broken parallel one.

**Build order — deploy a skeleton before building features.** As soon as you
have the absolute minimum round trip working — one form field → real Gemini
call → real DB write via the pooled connection → result displayed — deploy
it to Vercel immediately, before it looks good or does everything. This
surfaces any integration-level break (env vars, connection string, CORS,
build config) with time still on the clock to fix it, instead of discovering
it five minutes before submission when you deploy for the first time at the end.

---

## CODE QUALITY BAR (applies to every agent, not just Backend)

- Modular, single-responsibility functions/components — no business logic
  in route handlers or in UI components
- Consistent naming and formatting, no dead code, no commented-out code
- Proper async/await with try/catch on every call that can fail
- Comments explain "why," never "what"
- Server-side input validation and sanitization everywhere, parameterized
  queries only, explicit CORS config, secrets in `.env` only

---

## SCORING-ALIGNED PRIORITY ORDER

When time runs short, protect quality in this order — it matches how the
event actually weights scoring, so cutting corners lower on this list costs
less than cutting corners higher on it:

1. Problem Statement Alignment (highest)
2. Code Quality (highest)
3. Security
4. Efficiency
5. Testing
6. Accessibility

Never sacrifice #1 or #2 to buy time for #5 or #6.

---

## FINAL OUTPUT REQUIREMENTS

1. `CONTRACT.md` and final `COMMS.md` log, in full
2. Every file, in full, in separate Markdown code blocks with filenames —
   no summaries, no omissions, no "implement here" placeholders
3. Backend code, frontend code, schema, API routes, AI integration, UI
   components, styling, tests, README (with a "how an evaluator verifies
   this actually works" section and test credentials if applicable),
   `.env.example`, deployment instructions
4. A final self-audit against the `CONTRACT.md` acceptance checklist, item by
   item, each marked VERIFIED or ASSUMED — do not submit with any item still ASSUMED
5. A clean GitHub repository containing the full source (both `/client` and
   `/server`, or your merged single-service structure), a `.gitignore` that
   excludes `node_modules`, `.env`, and any build artifacts, and a working
   `README.md` at the repo root — since this repo itself is part of what
   gets submitted for evaluator testing, not just the deployed link
