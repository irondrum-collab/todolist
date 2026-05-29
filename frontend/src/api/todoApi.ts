import { apiClient } from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '../types/todo';

export async function getTodos(filters?: TodoFilters): Promise<Todo[]> {
  const params: Record<string, unknown> = {};
  if (filters?.categoryId !== undefined) params.categoryId = filters.categoryId;
  if (filters?.status && filters.status !== '전체') params.status = filters.status;

  const res = await apiClient.get<Todo[]>('/todos', { params });
  return res.data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const res = await apiClient.post<Todo>('/todos', input);
  return res.data;
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<Todo> {
  const res = await apiClient.put<Todo>(`/todos/${id}`, input);
  return res.data;
}

export async function deleteTodo(id: number): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}
