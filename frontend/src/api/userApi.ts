import { apiClient } from './client';
import type { User, UpdateUserInput } from '../types/user';

export async function updateMe(input: UpdateUserInput): Promise<User> {
  const res = await apiClient.put<{ user: User }>('/users/me', input);
  return res.data.user;
}
