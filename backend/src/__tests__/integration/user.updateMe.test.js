require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db/pool');

const TEST_EMAIL = `test_user_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password1!';
const TEST_NAME = '수정테스터';

let token;
let userId;

beforeAll(async () => {
  // 테스트 사용자 등록
  await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME });

  // 로그인 후 token 획득
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
  await pool.end();
});

describe('PUT /api/users/me', () => {
  test('정상 이름 변경 → 200 { user: { name: 새이름, ... } }', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '새이름' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      name: '새이름',
      email: TEST_EMAIL,
    });
    expect(res.body.user).toHaveProperty('createdAt');
  });

  test('정상 비밀번호 변경 → 200', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'NewPassword1!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');

    // 변경된 비밀번호로 로그인 가능 확인 후 원래 비밀번호로 복구
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'NewPassword1!' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    // 원래 비밀번호로 복구
    await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'NewPassword1!', newPassword: TEST_PASSWORD });

    const revertLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    token = revertLogin.body.token;
  });

  test('현재 비밀번호 불일치 → 401', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongPassword1!', newPassword: 'NewPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('newPassword 강도 미달 → 400', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: TEST_PASSWORD, newPassword: '1234' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('미인증 (토큰 없음) → 401', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .send({ name: '이름변경' });

    expect(res.status).toBe(401);
  });

  test('변경사항 없이 요청 → 200 (현재 정보 반환)', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', TEST_EMAIL);
    expect(res.body.user).toHaveProperty('createdAt');
  });

  test('theme 변경 (dark) → 200, user.theme === "dark"', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('theme', 'dark');

    // 원래 값으로 복구
    await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'light' });
  });

  test('language 변경 (en) → 200, user.language === "en"', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'en' });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('language', 'en');

    // 원래 값으로 복구
    await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'ko' });
  });

  test('유효하지 않은 theme → 400', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('유효하지 않은 language → 400', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ language: 'fr' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
