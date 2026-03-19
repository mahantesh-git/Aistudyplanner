# ROADMAP.md — AI Study Planner

**7 phases** | **21 requirements mapped** | All v1 requirements covered ✓

---

## Phase 1: Foundation — Project Scaffold & Auth

**Goal:** Establish the full-stack project structure with working authentication so users can register, log in, and access a protected dashboard.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, PROF-01, PROF-02

**Success Criteria:**
1. User can `POST /api/auth/register` and receive a JWT token
2. User can `POST /api/auth/login` with correct credentials and receive a JWT
3. Protected routes return 401 when JWT is missing or expired
4. User can `GET /api/user/profile` and `PUT /api/user/profile` with valid JWT
5. Passwords are bcrypt-hashed in MongoDB — no plaintext stored
6. Vite React frontend shows a login/register page and persists JWT in localStorage

---

## Phase 2: Subject & Topic Management

**Goal:** Users can manage their study subjects and topics with difficulty tagging and completion tracking.

**Requirements:** SUBJ-01, SUBJ-02, SUBJ-03, SUBJ-04, SUBJ-05, SUBJ-06

**Success Criteria:**
1. User can create, read, update, and delete subjects via API (CRUD verified with curl/Postman)
2. Topics embedded in subjects with title, difficulty (1–5), estimatedTime, and completed fields
3. User can mark a topic as `completed: true` via `PUT /api/subjects/:id`
4. All subject endpoints are protected by JWT middleware
5. Frontend has a working Subjects page listing all subjects with topic drill-down

---

## Phase 3: AI Study Plan Generator

**Goal:** Implement the scoring algorithm and daily plan generation so users receive an ordered list of study tasks based on priority, difficulty, and completion status.

**Requirements:** PLAN-01, PLAN-02, PLAN-03, PLAN-04

**Success Criteria:**
1. `POST /api/plan/generate` returns a valid plan JSON with date, subject, topic, and duration per task
2. Score formula `(priority * 0.5) + (difficulty * 0.3) + (incomplete * 0.2)` is applied correctly to rank topics
3. Time slot allocation respects user's `dailyStudyHours` preference from profile
4. `GET /api/plan/today` returns the most recently generated daily plan
5. Frontend displays generated plan on a dashboard widget sorted by score

---

## Phase 4: Task Management & Reminders

**Goal:** Users can manage daily tasks (auto-generated from plan + manual) with deadline tracking and basic cron reminders.

**Requirements:** TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06

**Success Criteria:**
1. `GET /api/tasks/today` returns all tasks (auto + manual) for the current user
2. User can `POST /api/tasks` to create a manual task linked to a subject
3. User can `PUT /api/tasks/:id` to mark a task complete or update scheduled time
4. User can `DELETE /api/tasks/:id` to remove a task
5. Tasks have a `deadline` field; past-due tasks are visually flagged in the frontend
6. A node-cron job fires at a scheduler interval and logs/alerts tasks due within 1 hour

---

## Phase 5: Progress Tracker

**Goal:** Surface completion rates, weekly study hours, and streak data so users can see their progress at a glance.

**Requirements:** PROG-01, PROG-02, PROG-03, PROG-04

**Success Criteria:**
1. `GET /api/progress` returns completion rate per subject (% topics completed)
2. Response includes total study hours for the current week
3. Streak counter correctly increments on consecutive study days and resets on missed days
4. Frontend has a dedicated Progress page with charts/stats (daily + weekly view)

---

## Phase 6: AI Recommendation Engine

**Goal:** Analyze user's topic data to surface weak areas, revision needs, and personalized tips.

**Requirements:** REC-01, REC-02, REC-03

**Success Criteria:**
1. `GET /api/recommendations` returns `weakTopics` (low completion + high difficulty topics)
2. `revision` field lists topics not studied in the last 3+ days
3. `tips` array contains at least one contextual tip based on user's study pattern
4. Recommendations are personalized per user (data-isolated)
5. Frontend displays a Recommendations card/widget on the dashboard

---

## Phase 7: UI Polish & Production Hardening

**Goal:** Complete the frontend, wire all modules end-to-end, add error handling, loading states, and ensure the app is deployment-ready.

**Requirements:** All previously built modules — integration and polish pass

**Success Criteria:**
1. All API endpoints have proper error handling (400, 401, 404, 500 responses)
2. Frontend has loading skeletons and error states for all async operations
3. MongoDB indexes are created on `userId`, `deadline`, and `scheduledTime` fields
4. `.env` file documented; no secrets committed to git
5. `README.md` includes setup instructions, API overview, and run commands
6. App runs cleanly with `npm run dev` (both frontend and backend)

---

## Phase Dependency Order

```
Phase 1 (Auth)
    └── Phase 2 (Subjects)
            └── Phase 3 (Plan Generator)
                    └── Phase 4 (Tasks)
                            └── Phase 5 (Progress)
                                    └── Phase 6 (Recommendations)
                                            └── Phase 7 (Polish)
```

*Each phase builds on the previous. Parallelization possible within a phase across frontend/backend.*
