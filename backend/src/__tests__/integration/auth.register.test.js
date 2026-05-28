require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db/pool');

const TEST_EMAIL_PREFIX = 'test_reg_';

beforeAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%'`);
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%'`);
  await pool.end();
});

describe('POST /api/auth/register', () => {
  test('정상 요청 → 201 { message }', async () => {
    const email = `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Password1!', name: '홍길동' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ message: '회원가입이 완료되었습니다.' });
  });

  test('이메일 중복 → 409', async () => {
    const email = `${TEST_EMAIL_PREFIX}dup_${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Password1!', name: '홍길동' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'Password1!', name: '홍길동' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  test('이메일 형식 오류 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email', password: 'Password1!', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ message: '유효하지 않은 이메일 형식입니다.' });
  });

  test('비밀번호 강도 미달 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `${TEST_EMAIL_PREFIX}pw_${Date.now()}@example.com`, password: '1234', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      message: '비밀번호는 8~128자이며 영문, 숫자, 특수문자를 각 1자 이상 포함해야 합니다.',
    });
  });

  test('필수 필드 누락 (email 없음) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'Password1!', name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('필수 필드 누락 (password 없음) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `${TEST_EMAIL_PREFIX}nopw_${Date.now()}@example.com`, name: '홍길동' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('필수 필드 누락 (name 없음) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `${TEST_EMAIL_PREFIX}noname_${Date.now()}@example.com`, password: 'Password1!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
