# PromptWars (Hyderabad) — Context Memory

> Feed this file to any model/agent before the build so it has full context
> on event rules, scoring, and constraints without you re-explaining.

## Event
- Google for Developers "PromptWars" (Build with AI) — in-person, one-day vibe
  coding hackathon for working professionals, happening across Indian cities.
- Built around **Google Antigravity** (AI-agent IDE built on VS Code).
- Only working professionals / startup founders (non-student) / freelancers
  are eligible. Students and previous PromptWars in-person participants are not.

## Timeline (build day)
- 9:00–10:00 AM — Check-in
- 10:00–10:30 AM — Kickoff & Introduction
- 10:30–11:30 AM — **Warm-up challenge** (practice only, not scored)
- 11:30 AM–2:30 PM — **Main challenge** (scored)
- 12:30–1:00 PM — submitting in this window during the main challenge earns
  a guaranteed **+2 bonus** on code assessment score
- 1:00–2:00 PM — Lunch & leaderboard freeze
- 2:30–3:00 PM — Top 10 announcement
- 3:00–5:30 PM — Snacks & pitching sessions
- 5:30–6:00 PM — Winners announcement

## Submission requirements
1. Deployed **web app** link only — no APK/mobile build accepted.
2. Brief description of the project built.
3. Clear statement of which Gen AI service(s) were used, and where.

## Attempt limits
- Warm-up: up to 1 submission (practice only, not scored).
- Main challenge: up to 3 submissions (scored); only the **last submitted
  attempt** counts as the final score (best attempt is not used).
- One retry allowed if a submission attempt fails due to a genuine
  connectivity/technical issue (not applicable once evaluation completes
  successfully).

## Scoring
- Leaderboard rankings come exclusively from automatic Code Assessment,
  evaluated against the defined problem statement.
- Six scored parameters, summed (no category ignored):
  - **Code Quality** — High Impact
  - **Problem Statement Alignment** — High Impact
  - **Security** — Medium Impact
  - **Efficiency** — Medium Impact
  - **Testing** — Low Impact
  - **Accessibility** — Low Impact
- Warm-up scores never count toward the leaderboard.
- A live leaderboard is shown during the event, reflecting Code Assessment
  scores only.

## Disqualification rules
- No static/hardcoded pages (UI shows an outcome but nothing real produces it).
- No mock or fake/placeholder data presented as real output.
- No hallucinated AI responses (output not actually from a working AI call).
- No false positives (features that look like they work in a demo but fail
  under real testing).
- Every demoed feature must run end-to-end with a real, working AI API call
  — not a canned response.
- If there's login/auth, test credentials must be shared so evaluators can
  access every feature.
- Even a Top 10 project gets disqualified if the deployed link isn't working
  or isn't aligned with the problem statement — a hands-on functional
  evaluation happens after the challenge closes specifically to catch this.

## Warm-up challenge problem statement (already revealed)
**"A cooking to-do list"** — build a simple AI micro-app that generates a
personal cooking to-do list based on the user's day, producing:
- Breakfast/Lunch/Dinner plan
- Grocery list
- Substitutions
- Budget feasibility logic

## Main challenge problem statement (revealed)
**"Breaking Bad Habits & Addiction"** — build a GenAI-powered web app that
helps users reduce or overcome harmful habits such as excessive screen time
or addictions. The solution must leverage Generative AI as a core component
to deliver intelligent nudges, personalized tracking, adaptive coaching, and
support mechanisms that encourage sustained behavior change.

Recommended scope: digital/screen-time habits specifically (not substance
addiction, which needs clinical guardrails a hackathon build can't
responsibly provide). Coaching tone should be supportive and non-shaming.

## What organizers say they want built
Not just chatbots. They're looking for:
- **AI Agents** — tools that actually perform tasks (e.g. summarizing data,
  automating a workflow)
- **Problem-solvers** — using Google Antigravity to tackle real issues in
  education, healthcare, productivity, or finance
- **Vibe-coded prototypes** — working apps with clear intent and smooth UX

## Builder context
- Building this with Antigravity (or equivalent agentic tool — not
  necessarily restricted to Gemini/Antigravity if another tool completes the
  task more reliably).
- Real DB (not mock data) is the deliberate choice for both warm-up and main
  builds, specifically to avoid the mock-data disqualification risk.
- Builder is an Android/Kotlin developer with limited web app experience —
  full build reasoning should not assume prior full-stack web background.
