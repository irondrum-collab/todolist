import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '../store/authStore';

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { login } from '../api/authApi';

const mockUser = {
  id: 1, email: 'test@example.com', name: '홍길동',
  theme: 'light' as const, language: 'ko' as const, createdAt: '2026-05-29T00:00:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(LoginPage)
      )
    )
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
  mockNavigate.mockClear();
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('이메일·비밀번호 입력 필드와 로그인 버튼을 렌더링한다', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('회원가입 링크를 표시한다', () => {
    renderPage();
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: '회원가입' })).toBeInTheDocument();
  });

  it('로그인 성공 시 /todos로 이동한다', async () => {
    vi.mocked(login).mockResolvedValueOnce({ token: 'jwt', user: mockUser });
    renderPage();

    await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'Pass123!');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/todos'));
  });

  it('로그인 실패 시 에러 메시지를 표시한다', async () => {
    const err = Object.assign(new Error(), {
      response: { data: { message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
    });
    vi.mocked(login).mockRejectedValueOnce(err);
    renderPage();

    await userEvent.type(screen.getByLabelText('이메일'), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다')
    );
  });

  it('이메일·비밀번호 미입력 시 API를 호출하지 않는다', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(login).not.toHaveBeenCalled();
  });
});
