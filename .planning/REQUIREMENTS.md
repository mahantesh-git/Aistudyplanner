# REQUIREMENTS.md — AI Study Planner

## v1 Requirements

### Authentication (AUTH)

- [ ] **AUTH-01**: User can register with email and password
- [ ] **AUTH-02**: User can log in and receive a JWT token for session management
- [ ] **AUTH-03**: JWT tokens expire and are properly handled on the client
- [ ] **AUTH-04**: Passwords are hashed using bcrypt before storage

### User Profile (PROF)

- [ ] **PROF-01**: User can view their profile (name, email, preferences)
- [ ] **PROF-02**: User can update daily study hours and preferred time slots in profile

### Subject Management (SUBJ)

- [ ] **SUBJ-01**: User can create a subject with name and priority level
- [ ] **SUBJ-02**: User can view all their subjects
- [ ] **SUBJ-03**: User can edit a subject's name and priority
- [ ] **SUBJ-04**: User can delete a subject
- [ ] **SUBJ-05**: User can add topics to a subject with title, difficulty (1–5), estimated time, and completion status
- [ ] **SUBJ-06**: User can mark a topic as completed

### Study Plan Generator (PLAN)

- [ ] **PLAN-01**: User can trigger AI plan generation for the day
- [ ] **PLAN-02**: System scores topics using formula: `score = (priority * 0.5) + (difficulty * 0.3) + (incomplete * 0.2)`
- [ ] **PLAN-03**: System allocates topics into time slots based on user's available daily hours
- [ ] **PLAN-04**: User can view today's generated plan with subject, topic, and duration per task

### Task Management (TASK)

- [ ] **TASK-01**: User can view today's task list (auto-generated + manual)
- [ ] **TASK-02**: User can create a manual task linked to a subject
- [ ] **TASK-03**: User can update a task (mark complete, change scheduled time)
- [ ] **TASK-04**: User can delete a task
- [ ] **TASK-05**: Tasks have deadline tracking
- [ ] **TASK-06**: System sends basic cron-based notifications for due tasks

### Progress Tracker (PROG)

- [ ] **PROG-01**: User can view completion rate per subject
- [ ] **PROG-02**: User can view total study hours per week
- [ ] **PROG-03**: User can view their current study streak (consecutive days)
- [ ] **PROG-04**: User can view daily and weekly progress statistics

### Recommendation Engine (REC)

- [ ] **REC-01**: System identifies weak topics (low completion + high difficulty)
- [ ] **REC-02**: System suggests revision topics (long gap since last study)
- [ ] **REC-03**: System provides personalized study tips based on user patterns

---

## v2 Requirements (Deferred)

- LLM-powered scheduling (upgrade from rule-based engine)
- OAuth login (Google, GitHub)
- Mobile app (React Native)
- Email notifications (SMTP integration)
- Collaborative study groups

---

## Out of Scope (v1)

- LLM AI engine — rule-based scoring first; LLM as future upgrade path
- Mobile app — web-first only
- OAuth providers — email/password only
- Real-time push notifications — cron-based basic reminders only
- Multi-language support — English only

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| AUTH-01 → AUTH-04 | Phase 1: Foundation | ☐ |
| PROF-01 → PROF-02 | Phase 1: Foundation | ☐ |
| SUBJ-01 → SUBJ-06 | Phase 2: Subject Management | ☐ |
| PLAN-01 → PLAN-04 | Phase 3: AI Study Plan Generator | ☐ |
| TASK-01 → TASK-06 | Phase 4: Task & Reminders | ☐ |
| PROG-01 → PROG-04 | Phase 5: Progress Tracker | ☐ |
| REC-01 → REC-03 | Phase 6: Recommendation Engine | ☐ |
