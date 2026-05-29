import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTodos } from './useTodos';
import type { Todo } from '../types/todo';

vi.mock('../api/todoApi', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { getTodos } from '../api/todoApi';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockTodo: Todo = {
  id: 1,
  title: '테스트 할 일',
  description: null,
  startDate: null,
  endDate: null,
  isCompleted: false,
  status: '진행 중 (날짜 없음)',
  categoryId: 1,
  userId: 1,
  createdAt: '2026-05-29T00:00:00Z',
  updatedAt: '2026-05-29T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTodos', () => {
  it('getTodos를 호출하고 데이터를 반환한다', async () => {
    vi.mocked(getTodos).mockResolvedValueOnce([mockTodo]);

    const { result } = renderHook(() => useTodos(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe(1);
  });

  it('filters를 queryKey에 포함하여 필터가 다르면 별도 쿼리로 처리한다', async () => {
    vi.mocked(getTodos).mockResolvedValue([]);

    const { result: r1 } = renderHook(() => useTodos({ categoryId: 1 }), { wrapper: makeWrapper() });
    const { result: r2 } = renderHook(() => useTodos({ categoryId: 2 }), { wrapper: makeWrapper() });

    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    // 각각 다른 queryKey로 getTodos가 2번 호출됨
    expect(getTodos).toHaveBeenCalledTimes(2);
  });

  it('fetch 실패 시 isError가 true가 된다', async () => {
    vi.mocked(getTodos).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useTodos(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
