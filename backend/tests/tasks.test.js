const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

describe('Tasks API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();
    await Task.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    token = res.body.token;
  });

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  it('should return empty list when no tasks exist', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Read Chapter 3', duration: 45 });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('topic', 'Read Chapter 3');
    expect(res.body).toHaveProperty('duration', 45);
    expect(res.body).toHaveProperty('completed', false);
  });

  it('should reject creating a task without a topic', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ duration: 30 });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should get a single task by id', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Practice Problems', duration: 60 });

    const id = created.body._id;

    const res = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', id);
    expect(res.body).toHaveProperty('topic', 'Practice Problems');
  });

  it('should update a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Old topic', duration: 30 });

    const id = created.body._id;

    const res = await request(app)
      .put(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Updated topic', duration: 90 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('topic', 'Updated topic');
    expect(res.body).toHaveProperty('duration', 90);
  });

  it('should delete a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'To delete', duration: 20 });

    const id = created.body._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toEqual(200);

    const getRes = await request(app)
      .get(`/api/tasks/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.statusCode).toEqual(404);
  });

  // ─── Complete ────────────────────────────────────────────────────────────────

  it('should mark a task as completed', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ topic: 'Finish homework', duration: 60 });

    const id = created.body._id;

    const res = await request(app)
      .patch(`/api/tasks/${id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('completed', true);
  });

  // ─── Auth guard ──────────────────────────────────────────────────────────────

  it('should deny access to tasks without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
  });
});
