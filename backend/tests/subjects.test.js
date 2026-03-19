const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Subject = require('../src/models/Subject');

describe('Subjects API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();
    await Subject.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    token = res.body.token;
  });

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  it('should return empty list when no subjects exist', async () => {
    const res = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('should create a new subject', async () => {
    const res = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mathematics', priority: 4 });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Mathematics');
    expect(res.body).toHaveProperty('priority', 4);
    expect(res.body).toHaveProperty('topics');
  });

  it('should reject creating a subject without a name', async () => {
    const res = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ priority: 3 });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('should get a single subject by id', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Physics', priority: 3 });

    const id = created.body._id;

    const res = await request(app)
      .get(`/api/subjects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', id);
    expect(res.body).toHaveProperty('name', 'Physics');
  });

  it('should update a subject', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Chemistry', priority: 2 });

    const id = created.body._id;

    const res = await request(app)
      .put(`/api/subjects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Chemistry (Updated)', priority: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Chemistry (Updated)');
    expect(res.body).toHaveProperty('priority', 5);
  });

  it('should delete a subject', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Biology', priority: 1 });

    const id = created.body._id;

    const deleteRes = await request(app)
      .delete(`/api/subjects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toEqual(200);

    const getRes = await request(app)
      .get(`/api/subjects/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.statusCode).toEqual(404);
  });

  // ─── Topics ──────────────────────────────────────────────────────────────────

  it('should add a topic to a subject', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Math', priority: 3 });

    const id = created.body._id;

    const res = await request(app)
      .post(`/api/subjects/${id}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Calculus', difficulty: 4, estimatedTime: 90 });

    expect(res.statusCode).toEqual(201);
    expect(res.body.topics.length).toBe(1);
    expect(res.body.topics[0]).toHaveProperty('title', 'Calculus');
    expect(res.body.topics[0]).toHaveProperty('difficulty', 4);
  });

  it('should mark a topic as studied', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Math', priority: 3 });

    const subjectId = created.body._id;

    const withTopic = await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Algebra', difficulty: 3 });

    const topicId = withTopic.body.topics[0]._id;

    const res = await request(app)
      .patch(`/api/subjects/${subjectId}/topics/${topicId}/study`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const topic = res.body.topics.find(t => t._id === topicId);
    expect(topic).toHaveProperty('completed', true);
    expect(topic.lastStudied).not.toBeNull();
  });

  it('should delete a topic', async () => {
    const created = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Science', priority: 2 });

    const subjectId = created.body._id;

    const withTopic = await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Newton Laws', difficulty: 2 });

    const topicId = withTopic.body.topics[0]._id;

    const res = await request(app)
      .delete(`/api/subjects/${subjectId}/topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.subject.topics.length).toBe(0);
  });

  // ─── Auth guard ──────────────────────────────────────────────────────────────

  it('should deny access to subjects without token', async () => {
    const res = await request(app).get('/api/subjects');
    expect(res.statusCode).toEqual(401);
  });
});
