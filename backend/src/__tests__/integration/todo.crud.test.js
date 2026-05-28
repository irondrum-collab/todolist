require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const pool = require('../../db/pool');

const TS = Date.now();
const USER1_EMAIL = `test_todo1_${TS}@example.com`;
const USER2_EMAIL = `test_todo2_${TS}@example.com`;
const PASSWORD = 'Password1!';

let token1;
let token2;
let user1Id;
let todoId;

beforeAll(async () => {
  // 잔여 데이터 정리
  await pool.query(`DELETE FROM users WHERE email LIKE 'test_todo1_%' OR email LIKE 'test_todo2_%'`);

  // user1 등록 및 로그인
  await request(app)
    .post('/api/auth/register')
    .send({ email: USER1_EMAIL, password: PASSWORD, name: '투두유저1' });

  const login1 = await request(app)
    .post('/api/auth/login')
    .send({ email: USER1_EMAIL, password: PASSWORD });

  token1 = login1.body.token;
  user1Id = login1.body.user.id;

  // user2 등록 및 로그인
  await request(app)
    .post('/api/auth/register')
    .send({ email: USER2_EMAIL, password: PASSWORD, name: '투두유저2' });

  const login2 = await request(app)
    .post('/api/auth/login')
    .send({ email: USER2_EMAIL, password: PASSWORD });

  token2 = login2.body.token;
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE 'test_todo1_%' OR email LIKE 'test_todo2_%'`);
  await pool.end();
});

describe('POST /api/todos', () => {
  test('정상 생성 → 201 { todo: { id, title, status, categoryId, ... } }', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '테스트 할 일' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo).toHaveProperty('id');
    expect(res.body.todo.title).toBe('테스트 할 일');
    expect(res.body.todo).toHaveProperty('status');
    expect(res.body.todo).toHaveProperty('categoryId');

    todoId = res.body.todo.id;
  });

  test('미인증 → 401', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: '테스트' });

    expect(res.status).toBe(401);
  });

  test('title 없음 → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ description: '제목 없음' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('end_date < start_date → 400', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '날짜 오류', startDate: '2024-12-31', endDate: '2024-01-01' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('GET /api/todos', () => {
  test('정상 조회 → 200 { todos: [...] } (본인 것만)', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('todos');
    expect(Array.isArray(res.body.todos)).toBe(true);
    // 모두 본인 것
    res.body.todos.forEach((t) => {
      expect(t.userId).toBe(user1Id);
    });
  });

  test('categoryId 필터 → 해당 카테고리 결과만', async () => {
    // user1의 첫 번째 todo를 만들었을 때 categoryId 확인
    const listRes = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token1}`);

    const firstTodo = listRes.body.todos[0];
    const catId = firstTodo.categoryId;

    const res = await request(app)
      .get(`/api/todos?categoryId=${catId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    res.body.todos.forEach((t) => {
      expect(t.categoryId).toBe(catId);
    });
  });

  test('status=완료 필터 → 완료된 것만', async () => {
    // 완료 상태 todo 생성
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '완료 할 일' });

    const completedId = createRes.body.todo.id;

    // 완료 처리
    await request(app)
      .put(`/api/todos/${completedId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ isCompleted: true });

    const res = await request(app)
      .get('/api/todos?status=완료')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    res.body.todos.forEach((t) => {
      expect(t.status).toBe('완료');
    });
  });
});

describe('PUT /api/todos/:id', () => {
  test('정상 수정 → 200 { todo }', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ title: '수정된 할 일' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo.title).toBe('수정된 할 일');
  });

  test('타인 소유 → 403', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ title: '타인 수정 시도' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
  });
});

describe('DELETE /api/todos/:id', () => {
  test('타인 소유 삭제 시도 → 403', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });

  test('정상 삭제 → 204', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(204);
  });
});
