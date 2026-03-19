const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Subject = require('../src/models/Subject');

describe('Progress API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await Subject.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    token = res.body.token;
  });

  // ─── Stats ───────────────────────────────────────────────────────────────────

  it('should return stats with zero counts when no data exists', async () => {
    const res = await request(app)
      .get('/api/progress/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('currentStreak');
    expect(res.body).toHaveProperty('thisWeek');
    expect(res.body.currentStreak).toBe(0);
    expect(res.body.thisWeek.tasksScheduled).toBe(0);
    expect(res.body.thisWeek.tasksCompleted).toBe(0);
  });

  it('should return stats object with correct shape', async () => {
    const res = await request(app)
      .get('/api/progress/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('currentStreak');
    expect(res.body).toHaveProperty('currentStreakUnit', 'days');
    expect(res.body).toHaveProperty('thisWeek');
    expect(res.body).toHaveProperty('dailyStats');
    expect(Array.isArray(res.body.dailyStats)).toBe(true);
  });

  // ─── Completion rates ────────────────────────────────────────────────────────

  it('should return completion rates', async () => {
    const res = await request(app)
      .get('/api/progress/completion')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    // Should return an object or array — just assert success and shape
    expect(res.body).toBeDefined();
  });

  // ─── Study hours ─────────────────────────────────────────────────────────────

  it('should return study hours for today', async () => {
    const res = await request(app)
      .get('/api/progress/study-hours?period=today')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalStudyHours');
    expect(res.body).toHaveProperty('period', 'today');
    expect(res.body).toHaveProperty('daily');
  });

  it('should return study hours for week', async () => {
    const res = await request(app)
      .get('/api/progress/study-hours?period=week')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalStudyHours');
    expect(res.body).toHaveProperty('period', 'week');
  });

  it('should return study hours for month', async () => {
    const res = await request(app)
      .get('/api/progress/study-hours?period=month')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalStudyHours');
    expect(res.body).toHaveProperty('period', 'month');
  });

  // ─── Auth guard ──────────────────────────────────────────────────────────────

  it('should deny access to stats without token', async () => {
    const res = await request(app).get('/api/progress/stats');
    expect(res.statusCode).toEqual(401);
  });

  it('should deny access to completion without token', async () => {
    const res = await request(app).get('/api/progress/completion');
    expect(res.statusCode).toEqual(401);
  });
});
