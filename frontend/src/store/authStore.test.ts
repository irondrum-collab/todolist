import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types/user';

vi.mock('../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}));

import i18n from '../i18n';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light',
  language: 'ko',
  createdAt: '2026-05-29T00:00:00Z',
};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  useAuthStore.setState({ token: null, user: null, theme: 'light', language: 'ko' });
  vi.clearAllMocks();
});

describe('authStore 초기 상태', () => {
  it('localStorage에 token이 없으면 token이 null이다', () => {
    const { token } = useAuthStore.getState();
    expect(token).toBeNull();
  });

  it('localStorage에 token이 있으면 token을 초기값으로 사용한다', () => {
    localStorage.setItem('token', 'saved-token');
    useAuthStore.setState({ token: localStorage.getItem('token') });

    const { token } = useAuthStore.getState();
    expect(token).toBe('saved-token');
  });

  it('초기 theme은 light이다', () => {
    expect(useAuthStore.getState().theme).toBe('light');
  });

  it('초기 language는 ko이다', () => {
    expect(useAuthStore.getState().language).toBe('ko');
  });

  it('localStorage에 theme=dark가 있으면 dark로 초기화한다', () => {
    localStorage.setItem('theme', 'dark');
    useAuthStore.setState({ theme: 'dark' });
    expect(useAuthStore.getState().theme).toBe('dark');
  });

  it('localStorage에 language=en이 있으면 en으로 초기화한다', () => {
    localStorage.setItem('language', 'en');
    useAuthStore.setState({ language: 'en' });
    expect(useAuthStore.getState().language).toBe('en');
  });
});

describe('setAuth', () => {
  it('token과 user를 state에 저장한다', () => {
    useAuthStore.getState().setAuth('new-token', mockUser);

    const { token, user } = useAuthStore.getState();
    expect(token).toBe('new-token');
    expect(user).toEqual(mockUser);
  });

  it('localStorage에 token을 저장한다', () => {
    useAuthStore.getState().setAuth('new-token', mockUser);

    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('로그인 후 서버 theme 값으로 state를 덮어쓴다', () => {
    const darkUser = { ...mockUser, theme: 'dark' as const };
    useAuthStore.getState().setAuth('token', darkUser);

    expect(useAuthStore.getState().theme).toBe('dark');
  });

  it('로그인 후 서버 language 값으로 state를 덮어쓴다', () => {
    const enUser = { ...mockUser, language: 'en' as const };
    useAuthStore.getState().setAuth('token', enUser);

    expect(useAuthStore.getState().language).toBe('en');
  });

  it('로그인 후 서버 theme이 localStorage에 저장된다', () => {
    const darkUser = { ...mockUser, theme: 'dark' as const };
    useAuthStore.getState().setAuth('token', darkUser);

    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('로그인 후 서버 language가 localStorage에 저장된다', () => {
    const enUser = { ...mockUser, language: 'en' as const };
    useAuthStore.getState().setAuth('token', enUser);

    expect(localStorage.getItem('language')).toBe('en');
  });

  it('로그인 후 서버 theme이 document에 적용된다', () => {
    const darkUser = { ...mockUser, theme: 'dark' as const };
    useAuthStore.getState().setAuth('token', darkUser);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('로그인 후 서버 language로 i18n.changeLanguage가 호출된다', () => {
    const enUser = { ...mockUser, language: 'en' as const };
    useAuthStore.getState().setAuth('token', enUser);

    expect(vi.mocked(i18n.changeLanguage)).toHaveBeenCalledWith('en');
  });
});

describe('clearAuth', () => {
  it('token과 user를 null로 초기화한다', () => {
    useAuthStore.getState().setAuth('some-token', mockUser);
    useAuthStore.getState().clearAuth();

    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('localStorage에서 token을 제거한다', () => {
    localStorage.setItem('token', 'some-token');
    useAuthStore.getState().clearAuth();

    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('setTheme', () => {
  it('state의 theme이 업데이트된다', () => {
    useAuthStore.getState().setTheme('dark');
    expect(useAuthStore.getState().theme).toBe('dark');
  });

  it('미로그인 상태 테마 변경 → localStorage에 저장된다', () => {
    useAuthStore.getState().setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('setTheme("dark") 호출 시 document.documentElement에 data-theme="dark" 적용', () => {
    useAuthStore.getState().setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme("light") 호출 시 document.documentElement에 data-theme="light" 적용', () => {
    useAuthStore.getState().setTheme('dark');
    useAuthStore.getState().setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('dark → light 전환 시 state와 localStorage 모두 업데이트된다', () => {
    useAuthStore.getState().setTheme('dark');
    useAuthStore.getState().setTheme('light');

    expect(useAuthStore.getState().theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });
});

describe('setLanguage', () => {
  it('state의 language가 업데이트된다', () => {
    useAuthStore.getState().setLanguage('en');
    expect(useAuthStore.getState().language).toBe('en');
  });

  it('미로그인 상태 언어 변경 → localStorage에 저장된다', () => {
    useAuthStore.getState().setLanguage('en');
    expect(localStorage.getItem('language')).toBe('en');
  });

  it('setLanguage("en") 호출 시 i18n.changeLanguage("en")이 호출된다', () => {
    useAuthStore.getState().setLanguage('en');
    expect(vi.mocked(i18n.changeLanguage)).toHaveBeenCalledWith('en');
  });

  it('setLanguage("ko") 호출 시 i18n.changeLanguage("ko")이 호출된다', () => {
    useAuthStore.getState().setLanguage('ko');
    expect(vi.mocked(i18n.changeLanguage)).toHaveBeenCalledWith('ko');
  });

  it('en → ko 전환 시 state와 localStorage 모두 업데이트된다', () => {
    useAuthStore.getState().setLanguage('en');
    useAuthStore.getState().setLanguage('ko');

    expect(useAuthStore.getState().language).toBe('ko');
    expect(localStorage.getItem('language')).toBe('ko');
  });
});
