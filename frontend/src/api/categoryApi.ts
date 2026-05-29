import { apiClient } from './client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/todo';

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<{ categories: Category[] }>('/categories');
  return res.data.categories;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const res = await apiClient.post<{ category: Category }>('/categories', input);
  return res.data.category;
}

export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<Category> {
  const res = await apiClient.put<{ category: Category }>(`/categories/${id}`, input);
  return res.data.category;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
