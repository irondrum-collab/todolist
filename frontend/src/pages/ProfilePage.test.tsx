import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { ProfilePage } from './ProfilePage';
import { useAuthStore } from '../store/authStore';

vi.mock('../api/userApi', () => ({
  updateMe: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../i18n', () => ({ default: { changeLanguage: vi.fn() } }));

import { updateMe } from '../api/userApi';

const mockUser = {
  id: 1, email: 'test@example.com', name: '홍길동',
  theme: 'light' as const, language: 'ko' as const, createdAt: '2026-05-29T00:00:00Z',
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(MemoryRouter, null,
        createElement(ProfilePage)
      )
    )
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
  mockNavigate.mockClear();
  vi.clearAllMocks();
});

describe('ProfilePage', () => {
  it('이름 변경·비밀번호 변경 섹션을 렌더링한다', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '이름 변경', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '비밀번호 변경', level: 2 })).toBeInTheDocument();
  });

  it('현재 이름이 이름 입력 필드에 미리 채워진다', () => {
    renderPage();
    expect(screen.getByLabelText('이름')).toHaveValue('홍길동');
  });

  it('미인증 시 /login으로 리다이렉트한다', () => {
    useAuthStore.setState({ token: null, user: null, theme: 'light', language: 'ko' });
    renderPage();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('이름 저장 성공 시 성공 메시지를 표시한다', async () => {
    const updatedUser = { ...mockUser, name: '김철수' };
    vi.mocked(updateMe).mockResolvedValueOnce(updatedUser);
    renderPage();

    const nameInput = screen.getByLabelText('이름');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    await userEvent.click(screen.getByRole('button', { name: '이름 저장' }));

    await waitFor(() =>
      expect(screen.getByText('이름이 저장되었습니다.')).toBeInTheDocument()
    );
  });

  it('이름 저장 성공 시 authStore user가 업데이트된다', async () => {
    const updatedUser = { ...mockUser, name: '김철수' };
    vi.mocked(updateMe).mockResolvedValueOnce(updatedUser);
    renderPage();

    const nameInput = screen.getByLabelText('이름');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    await userEvent.click(screen.getByRole('button', { name: '이름 저장' }));

    await waitFor(() =>
      expect(useAuthStore.getState().user?.name).toBe('김철수')
    );
  });

  it('새 비밀번호 확인 불일치 시 오류 메시지를 표시하고 API를 호출하지 않는다', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'oldPass123!');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newPass123!');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'different123!');
    await userEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));

    expect(screen.getByText('새 비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    expect(updateMe).not.toHaveBeenCalled();
  });

  it('현재 비밀번호 불일치 시 오류 메시지를 표시한다', async () => {
    const err = Object.assign(new Error(), {
      response: { data: { message: '현재 비밀번호가 올바르지 않습니다' } },
    });
    vi.mocked(updateMe).mockRejectedValueOnce(err);
    renderPage();

    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'wrongPass!');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newPass123!');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'newPass123!');
    await userEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));

    await waitFor(() =>
      expect(screen.getByText('현재 비밀번호가 올바르지 않습니다')).toBeInTheDocument()
    );
  });

  it('비밀번호 변경 성공 시 성공 메시지를 표시하고 입력 필드를 초기화한다', async () => {
    vi.mocked(updateMe).mockResolvedValueOnce(mockUser);
    renderPage();

    await userEvent.type(screen.getByLabelText('현재 비밀번호'), 'oldPass123!');
    await userEvent.type(screen.getByLabelText('새 비밀번호'), 'newPass123!');
    await userEvent.type(screen.getByLabelText('새 비밀번호 확인'), 'newPass123!');
    await userEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));

    await waitFor(() =>
      expect(screen.getByText('비밀번호가 변경되었습니다.')).toBeInTheDocument()
    );
    expect(screen.getByLabelText('현재 비밀번호')).toHaveValue('');
    expect(screen.getByLabelText('새 비밀번호')).toHaveValue('');
    expect(screen.getByLabelText('새 비밀번호 확인')).toHaveValue('');
  });

  it('이름이 비어있을 때 이름 저장 버튼이 비활성화된다', async () => {
    renderPage();
    const nameInput = screen.getByLabelText('이름');
    await userEvent.clear(nameInput);
    expect(screen.getByRole('button', { name: '이름 저장' })).toBeDisabled();
  });
});

describe('ProfilePage — 화면 설정(테마)', () => {
  it('화면 설정 섹션을 렌더링한다', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '화면 설정', level: 2 })).toBeInTheDocument();
  });

  it('라이트 모드 라디오 버튼이 초기 선택 상태이다', () => {
    renderPage();
    expect(screen.getByRole('radio', { name: '라이트 모드' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '다크 모드' })).not.toBeChecked();
  });

  it('다크 모드 라디오 선택 시 theme state가 dark로 변경된다', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('radio', { name: '다크 모드' }));
    expect(useAuthStore.getState().theme).toBe('dark');
  });

  it('다크 모드가 이미 선택된 경우 다크 모드 라디오가 체크된다', () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'dark', language: 'ko' });
    renderPage();
    expect(screen.getByRole('radio', { name: '다크 모드' })).toBeChecked();
  });

  it('설정 저장 클릭 시 updateMe({ theme, language }) 를 호출한다', async () => {
    vi.mocked(updateMe).mockResolvedValueOnce(mockUser);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '설정 저장' }));
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light', language: 'ko' }))
    );
  });

  it('설정 저장 성공 시 성공 메시지를 표시한다', async () => {
    vi.mocked(updateMe).mockResolvedValueOnce(mockUser);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '설정 저장' }));
    await waitFor(() =>
      expect(screen.getByText('설정이 저장되었습니다.')).toBeInTheDocument()
    );
  });

  it('설정 저장 실패 시 에러 메시지를 표시한다', async () => {
    vi.mocked(updateMe).mockRejectedValueOnce(new Error('서버 오류'));
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '설정 저장' }));
    await waitFor(() =>
      expect(screen.getByText('설정 저장에 실패했습니다.')).toBeInTheDocument()
    );
  });
});

describe('ProfilePage — 화면 설정(언어)', () => {
  it('한국어와 English 라디오 버튼을 표시한다', () => {
    renderPage();
    expect(screen.getByRole('radio', { name: '한국어' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'English' })).toBeInTheDocument();
  });

  it('초기 언어가 ko이면 한국어 라디오가 선택 상태이다', () => {
    renderPage();
    expect(screen.getByRole('radio', { name: '한국어' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'English' })).not.toBeChecked();
  });

  it('언어가 en이면 English 라디오가 선택 상태이다', () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'en' });
    renderPage();
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
  });

  it('English 라디오 선택 시 language state가 en으로 변경된다', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(useAuthStore.getState().language).toBe('en');
  });

  it('설정 저장 클릭 시 updateMe에 language가 포함된다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'en' });
    vi.mocked(updateMe).mockResolvedValueOnce(mockUser);
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '설정 저장' }));
    await waitFor(() =>
      expect(updateMe).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }))
    );
  });
});
