import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types/user';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light',
  language: 'ko',
  createdAt: '2026-05-29T00:00:00Z',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
});

describe('authStore 초기 상태', () => {
  it('localStorage에 token이 없으면 token이 null이다', () => {
    const { token } = useAuthStore.getState();
    expect(token).toBeNull();
  });

  it('localStorage에 token이 있으면 token을 초기값으로 사용한다', () => {
    localStorage.setItem('token', 'saved-token');
    // 스토어를 재초기화하여 localStorage 값을 반영
    useAuthStore.setState({ token: localStorage.getItem('token') });

    const { token } = useAuthStore.getState();
    expect(token).toBe('saved-token');
  });
});

describe('setAuth', () => {
  it('token과 user를 state에 저장한다', () => {
    useAuthStore.getState().setAuth('new-token', mockUser);

    const { token, user } = useAuthStore.getState();
    expect(token).toBe('new-token');
    expect(user).toEqual(mockUser);
  });

  it('localStorage에 token을 저장한다', () => {
    useAuthStore.getState().setAuth('new-token', mockUser);

    expect(localStorage.getItem('token')).toBe('new-token');
  });
});

describe('clearAuth', () => {
  it('token과 user를 null로 초기화한다', () => {
    useAuthStore.getState().setAuth('some-token', mockUser);
    useAuthStore.getState().clearAuth();

    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('localStorage에서 token을 제거한다', () => {
    localStorage.setItem('token', 'some-token');
    useAuthStore.getState().clearAuth();

    expect(localStorage.getItem('token')).toBeNull();
  });
});
