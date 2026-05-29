import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/authApi';
import { updateMe } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import type { LoginInput, RegisterInput, UpdateUserInput } from '../types/user';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
  });
}

export function useUpdateMe() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateMe(input),
    onSuccess: (user) => {
      if (token) setAuth(token, user);
    },
  });
}
