const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  // ─── Register ──────────────────────────────────────────────────────────────

  it('should register a new user and return token + user object', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user).toHaveProperty('name', 'Test User');
    expect(res.body.user).not.toHaveProperty('passwordHash'); // never expose hash
  });

  it('should reject register when email already exists', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User A', email: 'dup@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: 'dup@example.com', password: 'different123' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists with this email');
  });

  it('should reject register when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-name@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(400);
  });

  it('should reject register when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Email', password: 'password123' });

    expect(res.statusCode).toEqual(400);
  });

  it('should reject register when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Password', email: 'nopw@example.com' });

    expect(res.statusCode).toEqual(400);
  });

  // ─── Login ────────────────────────────────────────────────────────────────

  it('should login with correct credentials and return token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'correctpassword' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should reject login with unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' });

    expect(res.statusCode).toEqual(401);
  });

  it('should reject login when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.statusCode).toEqual(400);
  });

  it('should reject login when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toEqual(400);
  });
});
