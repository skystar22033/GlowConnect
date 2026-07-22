const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  const userPayload = {
    username: 'ayesha',
    email: 'ayesha@example.com',
    password: 'password123',
    fullName: 'Ayesha Altaf',
  };

  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(userPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('ayesha');
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...userPayload, username: 'someoneelse' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects registration with a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...userPayload, password: '123' });
    expect(res.status).toBe(400);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(userPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('rejects protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('allows access to protected route with valid token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(userPayload);
    const token = registerRes.body.data.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(userPayload.email);
  });
});
