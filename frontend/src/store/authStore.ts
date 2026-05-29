import { create } from 'zustand';
import type { User } from '../types/user';
import i18n from '../i18n';

type Theme = 'light' | 'dark';
type Language = 'ko' | 'en';

interface AuthState {
  token: string | null;
  user: User | null;
  theme: Theme;
  language: Language;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function loadTheme(): Theme {
  const stored = localStorage.getItem('theme');
  return stored === 'dark' ? 'dark' : 'light';
}

function loadLanguage(): Language {
  const stored = localStorage.getItem('language');
  return stored === 'en' ? 'en' : 'ko';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyLanguage(language: Language) {
  i18n.changeLanguage(language);
}

const initialTheme = loadTheme();
const initialLanguage = loadLanguage();
applyTheme(initialTheme);
applyLanguage(initialLanguage);

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: loadUser(),
  theme: initialTheme,
  language: initialLanguage,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('theme', user.theme);
    localStorage.setItem('language', user.language);
    applyTheme(user.theme);
    applyLanguage(user.language);
    set({ token, user, theme: user.theme, language: user.language });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    applyLanguage(language);
    set({ language });
  },
}));
