const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('User API', () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    token = res.body.token;
  });

  // ─── GET /api/user/profile ─────────────────────────────────────────────────

  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', 'test@example.com');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('should include preferences in profile', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('preferences');
  });

  it('should deny GET profile without token', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.statusCode).toEqual(401);
  });

  // ─── PUT /api/user/profile ─────────────────────────────────────────────────

  it('should update user name', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('should update user preferences', async () => {
    const prefs = {
      dailyStudyHours: 5,
      preferredTimeSlots: ['evening', 'night'],
    };

    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ preferences: prefs });

    expect(res.statusCode).toEqual(200);
    expect(res.body.preferences).toHaveProperty('dailyStudyHours', 5);
    expect(res.body.preferences.preferredTimeSlots).toContain('evening');
  });

  it('should update both name and preferences together', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', preferences: { dailyStudyHours: 3 } });

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.preferences.dailyStudyHours).toBe(3);
  });

  it('should deny PUT profile without token', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .send({ name: 'Hacker' });

    expect(res.statusCode).toEqual(401);
  });
});
