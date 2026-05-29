import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { getTodos, createTodo, updateTodo, deleteTodo } from './todoApi';
import type { Todo } from '../types/todo';

const mock = new MockAdapter(apiClient);

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
  createdAt: '2026-05-28T00:00:00Z',
  updatedAt: '2026-05-28T00:00:00Z',
};

beforeEach(() => {
  mock.reset();
  localStorage.clear();
});

describe('getTodos', () => {
  it('GET /todos를 호출하고 목록을 반환한다', async () => {
    mock.onGet('/todos').reply(200, [mockTodo]);

    const result = await getTodos();

    expect(mock.history.get[0].url).toBe('/todos');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('categoryId 필터를 쿼리 파라미터로 전달한다', async () => {
    mock.onGet('/todos').reply(200, []);

    await getTodos({ categoryId: 2 });

    expect(mock.history.get[0].params).toMatchObject({ categoryId: 2 });
  });

  it('status 필터를 쿼리 파라미터로 전달한다', async () => {
    mock.onGet('/todos').reply(200, []);

    await getTodos({ status: '진행 중' });

    expect(mock.history.get[0].params).toMatchObject({ status: '진행 중' });
  });

  it('status가 전체이면 파라미터에 포함하지 않는다', async () => {
    mock.onGet('/todos').reply(200, []);

    await getTodos({ status: '전체' });

    expect(mock.history.get[0].params?.status).toBeUndefined();
  });
});

describe('createTodo', () => {
  it('POST /todos를 올바른 payload로 호출하고 생성된 Todo를 반환한다', async () => {
    mock.onPost('/todos').reply(201, mockTodo);

    const result = await createTodo({ title: '테스트 할 일' });

    expect(mock.history.post[0].url).toBe('/todos');
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.title).toBe('테스트 할 일');
    expect(result.id).toBe(1);
  });
});

describe('updateTodo', () => {
  it('PUT /todos/:id를 올바른 payload로 호출하고 수정된 Todo를 반환한다', async () => {
    const updated = { ...mockTodo, title: '수정된 할 일' };
    mock.onPut('/todos/1').reply(200, updated);

    const result = await updateTodo(1, { title: '수정된 할 일' });

    expect(mock.history.put[0].url).toBe('/todos/1');
    expect(result.title).toBe('수정된 할 일');
  });
});

describe('deleteTodo', () => {
  it('DELETE /todos/:id를 호출한다', async () => {
    mock.onDelete('/todos/1').reply(204);

    await deleteTodo(1);

    expect(mock.history.delete[0].url).toBe('/todos/1');
  });
});
