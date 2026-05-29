import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from './useTodoMutations';
import type { Todo } from '../types/todo';

vi.mock('../api/todoApi', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { createTodo, updateTodo, deleteTodo } from '../api/todoApi';

const mockTodo: Todo = {
  id: 1,
  title: '테스트',
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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { queryClient, wrapper: ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateTodo', () => {
  it('createTodo 성공 시 isSuccess가 true가 된다', async () => {
    vi.mocked(createTodo).mockResolvedValueOnce(mockTodo);
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useCreateTodo(), { wrapper });

    act(() => {
      result.current.mutate({ title: '새 할 일' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('createTodo 성공 시 todos 쿼리를 invalidate한다', async () => {
    vi.mocked(createTodo).mockResolvedValueOnce(mockTodo);
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateTodo(), { wrapper });

    act(() => {
      result.current.mutate({ title: '새 할 일' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});

describe('useUpdateTodo', () => {
  it('updateTodo 성공 시 isSuccess가 true가 된다', async () => {
    vi.mocked(updateTodo).mockResolvedValueOnce({ ...mockTodo, title: '수정됨' });
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    act(() => {
      result.current.mutate({ id: 1, input: { title: '수정됨' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('updateTodo 성공 시 todos 쿼리를 invalidate한다', async () => {
    vi.mocked(updateTodo).mockResolvedValueOnce({ ...mockTodo, title: '수정됨' });
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateTodo(), { wrapper });

    act(() => {
      result.current.mutate({ id: 1, input: { title: '수정됨' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});

describe('useDeleteTodo', () => {
  it('deleteTodo 성공 시 isSuccess가 true가 된다', async () => {
    vi.mocked(deleteTodo).mockResolvedValueOnce(undefined);
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('deleteTodo 성공 시 todos 쿼리를 invalidate한다', async () => {
    vi.mocked(deleteTodo).mockResolvedValueOnce(undefined);
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteTodo(), { wrapper });

    act(() => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['todos'] });
  });
});
