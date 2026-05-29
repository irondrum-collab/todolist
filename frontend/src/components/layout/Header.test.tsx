import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '../../store/authStore';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-05-29T00:00:00Z',
};

// useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
  mockNavigate.mockClear();
});

describe('Header — 비로그인 상태', () => {
  it('로고를 표시한다', () => {
    renderHeader();
    expect(screen.getByText('TodoList')).toBeInTheDocument();
  });

  it('로그인 링크를 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
  });

  it('회원가입 링크를 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument();
  });

  it('사용자 이름과 로그아웃 버튼을 표시하지 않는다', () => {
    renderHeader();
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument();
    expect(screen.queryByText('홍길동 님')).not.toBeInTheDocument();
  });
});

describe('Header — 로그인 상태', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser });
  });

  it('사용자 이름을 표시한다', () => {
    renderHeader();
    expect(screen.getByText('홍길동 님')).toBeInTheDocument();
  });

  it('내 정보 링크를 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: '내 정보' })).toBeInTheDocument();
  });

  it('로그아웃 버튼을 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('로그인·회원가입 링크를 표시하지 않는다', () => {
    renderHeader();
    expect(screen.queryByRole('link', { name: '로그인' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '회원가입' })).not.toBeInTheDocument();
  });

  it('로그아웃 클릭 시 clearAuth를 호출하고 /login으로 이동한다', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
