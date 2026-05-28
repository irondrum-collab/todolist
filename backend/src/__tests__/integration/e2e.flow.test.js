require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db/pool');

const TS = Date.now();
const EMAIL = `test_e2e_${TS}@example.com`;
const PASSWORD = 'E2ePass1!';
const NAME = 'E2E테스터';

let token;
let userId;
let todoId;

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [EMAIL]);
  await pool.end();
});

describe('BE-09 전체 API 흐름 E2E', () => {
  test('1. POST /api/auth/register → 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: EMAIL, password: PASSWORD, name: NAME });
    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
  });

  test('2. POST /api/auth/login → 200, token 발급', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(EMAIL);
    token = res.body.token;
    userId = res.body.user.id;
  });

  test('3. POST /api/todos → 201, 할 일 생성', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E 테스트 할 일', startDate: '2026-05-28', endDate: '2026-06-30' });
    expect(res.status).toBe(201);
    expect(res.body.todo.title).toBe('E2E 테스트 할 일');
    expect(res.body.todo.status).toBeDefined();
    todoId = res.body.todo.id;
  });

  test('4. GET /api/todos → 200, 본인 할 일 목록', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(res.body.todos.some((t) => t.id === todoId)).toBe(true);
  });

  test('5. GET /api/todos?status=진행+중 → 200, 필터 동작', async () => {
    const res = await request(app)
      .get('/api/todos?status=진행 중')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    res.body.todos.forEach((t) => expect(t.status).toBe('진행 중'));
  });

  test('6. PUT /api/todos/:id → 200, 할 일 수정', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '수정된 E2E 할 일', isCompleted: true });
    expect(res.status).toBe(200);
    expect(res.body.todo.title).toBe('수정된 E2E 할 일');
    expect(res.body.todo.status).toBe('완료');
  });

  test('7. PUT /api/users/me → 200, 이름 수정', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E수정됨' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('E2E수정됨');
  });

  test('8. DELETE /api/todos/:id → 204, 할 일 삭제', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  test('9. 보호된 라우트 미인증 → 401', async () => {
    const [r1, r2, r3] = await Promise.all([
      request(app).get('/api/todos'),
      request(app).post('/api/todos').send({ title: '인증없음' }),
      request(app).put('/api/users/me').send({ name: '인증없음' }),
    ]);
    expect(r1.status).toBe(401);
    expect(r2.status).toBe(401);
    expect(r3.status).toBe(401);
  });

  test('10. 에러 응답 형식 { message } 확인', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'WrongPass1!' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });
});
