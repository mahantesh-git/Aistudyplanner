const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Subject = require('../src/models/Subject');
const Task = require('../src/models/Task');

describe('Recommendations API', () => {
  let token;
  let subjectId;

  beforeEach(async () => {
    await User.deleteMany();
    await Subject.deleteMany();
    await Task.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Rec User', email: 'rec@example.com', password: 'password123' });

    token = res.body.token;

    // Create a subject with a mix of topics
    const sub = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mathematics', priority: 4 });

    subjectId = sub.body._id;
  });

  // ─── GET /api/recommendations/weak-topics ─────────────────────────────────

  it('should return empty weak topics when no high-difficulty topics exist', async () => {
    // Add only low-difficulty topics
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Easy Algebra', difficulty: 2 });

    const res = await request(app)
      .get('/api/recommendations/weak-topics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('count', 0);
    expect(res.body).toHaveProperty('topics');
    expect(res.body.topics).toHaveLength(0);
  });

  it('should return high-difficulty incomplete topics as weak', async () => {
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Advanced Calculus', difficulty: 5 });

    const res = await request(app)
      .get('/api/recommendations/weak-topics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.topics[0]).toHaveProperty('topicTitle', 'Advanced Calculus');
    expect(res.body.topics[0]).toHaveProperty('difficulty', 5);
    expect(res.body.topics[0]).toHaveProperty('reason');
  });

  it('should not include completed topics in weak topics', async () => {
    const withTopic = await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hard Completed', difficulty: 5 });

    const topicId = withTopic.body.topics[0]._id;

    // Mark as completed
    await request(app)
      .patch(`/api/subjects/${subjectId}/topics/${topicId}/study`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/recommendations/weak-topics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const found = res.body.topics.some((t) => t.topicTitle === 'Hard Completed');
    expect(found).toBe(false);
  });

  it('should deny weak-topics without token', async () => {
    const res = await request(app).get('/api/recommendations/weak-topics');
    expect(res.statusCode).toEqual(401);
  });

  // ─── GET /api/recommendations/stale-topics ────────────────────────────────

  it('should return stale topics (never studied counts as stale)', async () => {
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Geometry', difficulty: 3 });

    const res = await request(app)
      .get('/api/recommendations/stale-topics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('topics');
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.topics[0]).toHaveProperty('reason', 'Not studied recently');
  });

  it('should accept ?days query parameter', async () => {
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Topology', difficulty: 4 });

    const res = await request(app)
      .get('/api/recommendations/stale-topics?days=1')
      .set('Authorization', `Bearer ${token}`);

    // Never-studied topics should appear even with days=1
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('count');
  });

  it('should not include completed topics in stale topics', async () => {
    const withTopic = await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Done Topic', difficulty: 3 });

    const topicId = withTopic.body.topics[0]._id;

    await request(app)
      .patch(`/api/subjects/${subjectId}/topics/${topicId}/study`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/recommendations/stale-topics')
      .set('Authorization', `Bearer ${token}`);

    const found = res.body.topics.some((t) => t.topicTitle === 'Done Topic');
    expect(found).toBe(false);
  });

  it('should deny stale-topics without token', async () => {
    const res = await request(app).get('/api/recommendations/stale-topics');
    expect(res.statusCode).toEqual(401);
  });

  // ─── GET /api/recommendations/revisions ────────────────────────────────────

  it('should return empty revisions when no topics are completed', async () => {
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Incomplete Topic', difficulty: 3 });

    const res = await request(app)
      .get('/api/recommendations/revisions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('count', 0);
    expect(res.body).toHaveProperty('suggestions');
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it('should provide response object shape for revisions', async () => {
    const res = await request(app)
      .get('/api/recommendations/revisions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('suggestions');
  });

  it('should deny revisions without token', async () => {
    const res = await request(app).get('/api/recommendations/revisions');
    expect(res.statusCode).toEqual(401);
  });

  // ─── GET /api/recommendations/tips ────────────────────────────────────────

  it('should return tips with context object', async () => {
    const res = await request(app)
      .get('/api/recommendations/tips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('context');
    expect(res.body).toHaveProperty('tips');
    expect(Array.isArray(res.body.tips)).toBe(true);
    expect(res.body.tips.length).toBeGreaterThan(0);
    expect(res.body.context).toHaveProperty('streak');
    expect(res.body.context).toHaveProperty('completionRate');
    expect(res.body.context).toHaveProperty('weakTopicsCount');
    expect(res.body.context).toHaveProperty('staleTopicsCount');
  });

  it('should reflect weak topics count in tips context', async () => {
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hard Topic', difficulty: 5 });

    const res = await request(app)
      .get('/api/recommendations/tips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.context.weakTopicsCount).toBeGreaterThan(0);
  });

  it('should deny tips without token', async () => {
    const res = await request(app).get('/api/recommendations/tips');
    expect(res.statusCode).toEqual(401);
  });

  // ─── GET /api/recommendations (full summary) ──────────────────────────────

  it('should return full recommendations summary with all keys', async () => {
    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('weakTopics');
    expect(res.body).toHaveProperty('staleTopics');
    expect(res.body).toHaveProperty('revisionSuggestions');
    expect(res.body).toHaveProperty('tips');
    expect(Array.isArray(res.body.weakTopics)).toBe(true);
    expect(Array.isArray(res.body.staleTopics)).toBe(true);
    expect(Array.isArray(res.body.revisionSuggestions)).toBe(true);
    expect(Array.isArray(res.body.tips)).toBe(true);
  });

  it('should surface weak and stale topics in summary when applicable', async () => {
    // Add a hard, never-studied topic
    await request(app)
      .post(`/api/subjects/${subjectId}/topics`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hard Stale Topic', difficulty: 5 });

    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.weakTopics.length).toBeGreaterThan(0);
    expect(res.body.staleTopics.length).toBeGreaterThan(0);
    expect(res.body.tips.length).toBeGreaterThan(0);
  });

  it('should limit summary lists to at most 5 items each', async () => {
    // Add 7 hard topics
    for (let i = 1; i <= 7; i++) {
      await request(app)
        .post(`/api/subjects/${subjectId}/topics`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: `Topic ${i}`, difficulty: 5 });
    }

    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.weakTopics.length).toBeLessThanOrEqual(5);
    expect(res.body.staleTopics.length).toBeLessThanOrEqual(5);
  });

  it('should deny full recommendations without token', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.statusCode).toEqual(401);
  });
});
