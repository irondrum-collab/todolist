import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { register, login } from './authApi';

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});

describe('register', () => {
  it('POST /auth/register를 올바른 payload로 호출한다', async () => {
    mock.onPost('/auth/register').reply(201);

    await register({ email: 'test@example.com', password: 'Pass123!', name: '홍길동' });

    expect(mock.history.post[0].url).toBe('/auth/register');
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toEqual({ email: 'test@example.com', password: 'Pass123!', name: '홍길동' });
  });

  it('서버 에러 시 예외를 던진다', async () => {
    mock.onPost('/auth/register').reply(409, { message: '이미 사용 중인 이메일입니다' });

    await expect(register({ email: 'dup@example.com', password: 'Pass123!', name: '홍길동' })).rejects.toThrow();
  });
});

describe('login', () => {
  it('POST /auth/login을 올바른 payload로 호출하고 LoginResponse를 반환한다', async () => {
    const mockResponse = {
      token: 'jwt-token',
      user: { id: 1, email: 'test@example.com', name: '홍길동', theme: 'light', language: 'ko', createdAt: '2026-05-28T00:00:00Z' },
    };
    mock.onPost('/auth/login').reply(200, mockResponse);

    const result = await login({ email: 'test@example.com', password: 'Pass123!' });

    expect(mock.history.post[0].url).toBe('/auth/login');
    expect(result.token).toBe('jwt-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('인증 실패 시 예외를 던진다', async () => {
    mock.onPost('/auth/login').reply(401, { message: '이메일 또는 비밀번호가 올바르지 않습니다' });

    await expect(login({ email: 'wrong@example.com', password: 'wrong' })).rejects.toThrow();
  });
});
