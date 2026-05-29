export interface User {
  id: number;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en';
}
