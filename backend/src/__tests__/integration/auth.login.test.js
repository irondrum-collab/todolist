require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const pool = require('../../db/pool');

const TEST_EMAIL = `test_login_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password1!';
const TEST_NAME = '로그인테스터';

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME });
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
  await pool.end();
});

describe('POST /api/auth/login', () => {
  test('정상 로그인 → 200 { token: string, user: { id, email, name, theme, language } }', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      token: expect.any(String),
      user: {
        id: expect.any(Number),
        email: TEST_EMAIL,
        name: TEST_NAME,
        theme: 'light',
        language: 'ko',
      },
    });
  });

  test('발급된 token으로 디코딩 시 { id, email } payload 확인', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);

    expect(decoded).toMatchObject({
      id: expect.any(Number),
      email: TEST_EMAIL,
    });
  });

  test('이메일 미존재 → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('비밀번호 불일치 → 401 (이메일 미존재와 동일한 message 값)', async () => {
    const wrongPwRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword1!' });

    const noUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: TEST_PASSWORD });

    expect(wrongPwRes.status).toBe(401);
    expect(noUserRes.status).toBe(401);
    expect(wrongPwRes.body.message).toBe(noUserRes.body.message);
  });

  test('email 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: TEST_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('password 누락 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
