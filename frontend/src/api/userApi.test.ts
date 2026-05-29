import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { updateMe } from './userApi';

const mock = new MockAdapter(apiClient);

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-05-28T00:00:00Z',
};

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});

describe('updateMe', () => {
  it('PUT /users/me를 올바른 payload로 호출하고 User를 반환한다', async () => {
    mock.onPut('/users/me').reply(200, { user: { ...mockUser, name: '김철수' } });

    const result = await updateMe({ name: '김철수' });

    expect(mock.history.put[0].url).toBe('/users/me');
    const body = JSON.parse(mock.history.put[0].data);
    expect(body.name).toBe('김철수');
    expect(result.name).toBe('김철수');
  });

  it('비밀번호 변경 payload를 전달한다', async () => {
    mock.onPut('/users/me').reply(200, { user: mockUser });

    await updateMe({ currentPassword: 'Old123!', newPassword: 'New123!' });

    const body = JSON.parse(mock.history.put[0].data);
    expect(body.currentPassword).toBe('Old123!');
    expect(body.newPassword).toBe('New123!');
  });

  it('현재 비밀번호 불일치 시 예외를 던진다', async () => {
    mock.onPut('/users/me').reply(401, { message: '현재 비밀번호가 올바르지 않습니다' });

    await expect(updateMe({ currentPassword: 'wrong', newPassword: 'New123!' })).rejects.toThrow();
  });
});
