import { apiClient } from './client';
import type { LoginResponse, RegisterInput, LoginInput } from '../types/user';

export async function register(input: RegisterInput): Promise<void> {
  await apiClient.post('/auth/register', input);
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', input);
  return res.data;
}
