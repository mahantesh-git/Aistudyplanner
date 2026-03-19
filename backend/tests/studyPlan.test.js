const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Subject = require('../src/models/Subject');
const Task = require('../src/models/Task');

describe('Study Plan API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();
    await Subject.deleteMany();
    await Task.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Planner User', email: 'planner@example.com', password: 'password123' });

    token = res.body.token;
  });

  // ─── GET /api/study-plan ───────────────────────────────────────────────────

  it('should return empty plan when no subjects exist', async () => {
    const res = await request(app)
      .get('/api/study-plan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('date');
    expect(res.body).toHaveProperty('totalMinutes');
    expect(res.body).toHaveProperty('topicsScheduled', 0);
    expect(res.body).toHaveProperty('plan');
    expect(Array.isArray(res.body.plan)).toBe(true);
    expect(res.body.plan.length).toBe(0);
  });

  it('should generate a plan with topics from existing subjects', async () => {
    // Create a subject with an incomplete topic
    const subject = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Math', priority: 5 });

    await request(app)
      .post(`/api/subjects/${subject.body._id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Calculus', difficulty: 4, estimatedTime: 60 });

    const res = await request(app)
      .get('/api/study-plan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.topicsScheduled).toBeGreaterThan(0);
    expect(res.body.plan[0]).toHaveProperty('topicTitle', 'Calculus');
    expect(res.body.plan[0]).toHaveProperty('allocatedMinutes');
    expect(res.body.plan[0]).toHaveProperty('scheduledTime');
  });

  it('should skip already completed topics in the plan', async () => {
    const subject = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Science', priority: 3 });

    const subjectId = subject.body._id;

    const withTopic = await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Newton Laws', difficulty: 3, estimatedTime: 45 });

    const topicId = withTopic.body.topics[0]._id;

    // Mark as studied (completed)
    await request(app)
      .patch(`/api/subjects/${subjectId}/topics/${topicId}/study`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/study-plan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    // Completed topics should NOT appear in the plan
    const inPlan = res.body.plan.some((p) => p.topicTitle === 'Newton Laws');
    expect(inPlan).toBe(false);
  });

  it('should accept a specific date query param', async () => {
    const res = await request(app)
      .get('/api/study-plan?date=2025-06-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.date).toBe('2025-06-15');
  });

  it('should prioritise higher-priority subjects in the plan', async () => {
    // Create two subjects with very different priorities
    const low = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Low Priority', priority: 1 });

    const high = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'High Priority', priority: 5 });

    await request(app)
      .post(`/api/subjects/${low.body._id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Easy Topic', difficulty: 1, estimatedTime: 30 });

    await request(app)
      .post(`/api/subjects/${high.body._id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hard Topic', difficulty: 5, estimatedTime: 30 });

    const res = await request(app)
      .get('/api/study-plan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    // First item should be the high-priority subject's topic
    expect(res.body.plan[0].subjectName).toBe('High Priority');
  });

  it('should deny access without token', async () => {
    const res = await request(app).get('/api/study-plan');
    expect(res.statusCode).toEqual(401);
  });

  // ─── POST /api/study-plan/generate ────────────────────────────────────────

  it('should return empty tasks message when no subjects exist', async () => {
    const res = await request(app)
      .post('/api/study-plan/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'No incomplete topics found to schedule');
    expect(res.body.tasks).toHaveLength(0);
  });

  it('should save tasks when subjects with incomplete topics exist', async () => {
    const subject = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Physics', priority: 4 });

    await request(app)
      .post(`/api/subjects/${subject.body._id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Optics', difficulty: 3, estimatedTime: 60 });

    const res = await request(app)
      .post('/api/study-plan/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: new Date().toISOString().split('T')[0] });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('tasksCreated');
    expect(res.body.tasksCreated).toBeGreaterThan(0);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks[0]).toHaveProperty('isAutoGenerated', true);
  });

  it('should overwrite existing auto-generated tasks when overwrite=true', async () => {
    const subject = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Chemistry', priority: 4 });

    await request(app)
      .post(`/api/subjects/${subject.body._id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Organic Chem', difficulty: 4, estimatedTime: 60 });

    const today = new Date().toISOString().split('T')[0];

    // Generate once
    await request(app)
      .post('/api/study-plan/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today });

    // Generate again with overwrite
    const res = await request(app)
      .post('/api/study-plan/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: today, overwrite: true });

    expect(res.statusCode).toEqual(201);
    // Should still have tasks (not crash or duplicate infinitely)
    expect(res.body.tasksCreated).toBeGreaterThan(0);
  });

  it('should deny POST generate without token', async () => {
    const res = await request(app).post('/api/study-plan/generate').send({});
    expect(res.statusCode).toEqual(401);
  });
});
