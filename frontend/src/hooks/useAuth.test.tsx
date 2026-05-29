import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useLogin, useRegister } from './useAuth';
import { useAuthStore } from '../store/authStore';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

import { login, register } from '../api/authApi';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-05-29T00:00:00Z',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
  vi.clearAllMocks();
});

describe('useLogin', () => {
  it('로그인 성공 시 authStore에 token과 user를 저장한다', async () => {
    vi.mocked(login).mockResolvedValueOnce({ token: 'jwt-token', user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'Pass123!' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const { token, user } = useAuthStore.getState();
    expect(token).toBe('jwt-token');
    expect(user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('로그인 실패 시 isError가 true가 된다', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('401'));

    const { result } = renderHook(() => useLogin(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'wrong@example.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useRegister', () => {
  it('회원가입 성공 시 isSuccess가 true가 된다', async () => {
    vi.mocked(register).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRegister(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'new@example.com', password: 'Pass123!', name: '신규' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('회원가입 실패 시 isError가 true가 된다', async () => {
    vi.mocked(register).mockRejectedValueOnce(new Error('409'));

    const { result } = renderHook(() => useRegister(), { wrapper: makeWrapper() });

    act(() => {
      result.current.mutate({ email: 'dup@example.com', password: 'Pass123!', name: '중복' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
