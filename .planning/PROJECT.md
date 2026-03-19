# AI Study Planner

## What This Is

An AI-powered web application that generates optimized daily study schedules for students and self-learners based on subject priority, topic difficulty, and user progress. The system uses a rule-based scoring engine (extensible to LLM) to intelligently allocate study time and surface weak areas for revision.

## Core Value

The planner must generate a meaningful, prioritized daily study schedule from the user's subjects and topics so students can study smarter without manual planning overhead.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User registration and login with JWT authentication
- [ ] User profile management with study preferences
- [ ] Subject creation, editing, deletion with priority tagging
- [ ] Topic management per subject with difficulty (1–5) and time estimates
- [ ] AI study plan generation using scoring formula: score = (priority * 0.5) + (difficulty * 0.3) + (incomplete * 0.2)
- [ ] Daily schedule view with time slot allocation
- [ ] Task management (auto-generated + manual tasks)
- [ ] Deadline tracking and basic cron-based notifications
- [ ] Progress tracker: topic completion, % per subject, streak, daily/weekly stats
- [ ] AI recommendation engine: weak topics, revision suggestions, personalized tips

### Out of Scope

- LLM-based AI scheduling — rule-based engine first; extensible later
- Mobile app — web only (React + Vite)
- Third-party OAuth — email/password only for v1
- Real-time push notifications — basic cron reminders only

## Context

- Previous conversations explored backends and frontend integrations for similar projects in this workspace
- Stack is fully defined in PRD: React + Tailwind + Vite (frontend), Node.js + Express (backend), MongoDB (database), JWT + bcrypt (auth), node-cron (scheduler)
- Scoring formula is fixed: `score = (priority * 0.5) + (difficulty * 0.3) + (incomplete * 0.2)`
- MongoDB should have proper indexing for performance targets (< 300ms response time)
- Modular service architecture is required to allow future LLM upgrade of AI engine

## Constraints

- **Tech Stack**: React + Tailwind + Vite / Node.js + Express / MongoDB / JWT — defined by PRD, non-negotiable
- **Performance**: API response time < 300ms
- **Security**: bcrypt password hashing, JWT expiry handling mandatory
- **Architecture**: Modular services for future AI upgrade path

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rule-based scoring engine | Ship fast, validate, then upgrade to LLM | — Pending |
| MongoDB over SQL | Flexible schema for topics/tasks, easy scaling | — Pending |
| Monorepo (frontend + backend together) | Single workspace, easier dev setup | — Pending |
| JWT stateless auth | Scalable, no server-side session storage | — Pending |

---
*Last updated: 2026-03-19 after initialization from PRD*
