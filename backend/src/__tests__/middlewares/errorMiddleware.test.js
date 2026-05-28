require('dotenv').config();
const request = require('supertest');
const express = require('express');
const errorMiddleware = require('../../middlewares/errorMiddleware');

const makeApp = (errorFactory) => {
  const app = express();
  app.get('/test', (_req, _res, next) => next(errorFactory()));
  app.use(errorMiddleware);
  return app;
};

describe('errorMiddleware', () => {
  test('400 에러 — 그대로 반환', async () => {
    const app = makeApp(() => Object.assign(new Error('잘못된 요청'), { status: 400 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: '잘못된 요청' });
  });

  test('401 에러 — 그대로 반환', async () => {
    const app = makeApp(() => Object.assign(new Error('인증 필요'), { status: 401 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: '인증 필요' });
  });

  test('403 에러 — 그대로 반환', async () => {
    const app = makeApp(() => Object.assign(new Error('접근 금지'), { status: 403 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: '접근 금지' });
  });

  test('404 에러 — 그대로 반환', async () => {
    const app = makeApp(() => Object.assign(new Error('리소스 없음'), { status: 404 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: '리소스 없음' });
  });

  test('409 에러 — 그대로 반환', async () => {
    const app = makeApp(() => Object.assign(new Error('중복 충돌'), { status: 409 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: '중복 충돌' });
  });

  test('status 없는 에러 — 500 반환', async () => {
    const app = makeApp(() => new Error('예상치 못한 오류'));
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: '예상치 못한 오류' });
  });

  test('메시지 없는 에러 — 500 기본 메시지 반환', async () => {
    const app = makeApp(() => new Error());
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('서버 내부 오류가 발생했습니다.');
  });

  test('알 수 없는 status 코드 — 500으로 처리', async () => {
    const app = makeApp(() => Object.assign(new Error('알 수 없는 상태'), { status: 422 }));
    const res = await request(app).get('/test');
    expect(res.status).toBe(500);
  });
});
