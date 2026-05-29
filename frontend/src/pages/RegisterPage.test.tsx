import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { RegisterPage } from './RegisterPage';
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

import { register } from '../api/authApi';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(RegisterPage)
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

describe('RegisterPage', () => {
  it('이름·이메일·비밀번호 입력 필드와 회원가입 버튼을 렌더링한다', () => {
    renderPage();
    expect(screen.getByLabelText('이름')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
  });

  it('로그인 링크를 표시한다', () => {
    renderPage();
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: '로그인' })).toBeInTheDocument();
  });

  it('회원가입 성공 시 /login으로 이동한다', async () => {
    vi.mocked(register).mockResolvedValueOnce(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('이름'), '홍길동');
    await userEvent.type(screen.getByLabelText('이메일'), 'new@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'Pass123!');
    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('이메일 중복 시 409 에러 메시지를 표시한다', async () => {
    const err = Object.assign(new Error(), {
      response: { data: { message: '이미 사용 중인 이메일입니다' } },
    });
    vi.mocked(register).mockRejectedValueOnce(err);
    renderPage();

    await userEvent.type(screen.getByLabelText('이름'), '홍길동');
    await userEvent.type(screen.getByLabelText('이메일'), 'dup@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'Pass123!');
    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('이미 사용 중인 이메일입니다')
    );
  });

  it('필수 항목 미입력 시 API를 호출하지 않는다', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(register).not.toHaveBeenCalled();
  });

  it('이메일 blur 시 형식 오류 메시지를 표시한다', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('이메일'), 'invalid-email');
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    );
  });

  it('비밀번호 blur 시 강도 미달 메시지를 표시한다', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('비밀번호'), 'short');
    await userEvent.tab();
    await waitFor(() =>
      expect(screen.getByText('8자 이상 입력해 주세요')).toBeInTheDocument()
    );
  });
});
