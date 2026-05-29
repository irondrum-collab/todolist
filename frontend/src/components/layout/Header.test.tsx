import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '../../store/authStore';
import { useUpdateMe } from '../../hooks/useAuth';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: '홍길동',
  theme: 'light' as const,
  language: 'ko' as const,
  createdAt: '2026-05-29T00:00:00Z',
};

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useAuth');
vi.mock('../../i18n', () => ({ default: { changeLanguage: vi.fn() } }));

const mockSaveTheme = vi.fn();

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null, theme: 'light', language: 'ko' });
  mockNavigate.mockClear();
  mockSaveTheme.mockClear();
  vi.mocked(useUpdateMe).mockReturnValue({ mutate: mockSaveTheme, isPending: false } as ReturnType<typeof useUpdateMe>);
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
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
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

describe('Header — 테마 토글', () => {
  it('비로그인 상태에서 테마 토글 버튼을 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '다크 모드로 전환' })).toBeInTheDocument();
  });

  it('로그인 상태에서 테마 토글 버튼을 표시한다', () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    renderHeader();
    expect(screen.getByRole('button', { name: '다크 모드로 전환' })).toBeInTheDocument();
  });

  it('라이트 모드에서 "다크" 텍스트를 표시한다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '다크 모드로 전환' })).toHaveTextContent('다크');
  });

  it('다크 모드에서 "라이트" 텍스트를 표시한다', () => {
    useAuthStore.setState({ token: null, user: null, theme: 'dark', language: 'ko' });
    renderHeader();
    expect(screen.getByRole('button', { name: '라이트 모드로 전환' })).toHaveTextContent('라이트');
  });

  it('토글 클릭 시 theme state가 dark로 변경된다', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(useAuthStore.getState().theme).toBe('dark');
  });

  it('다크→라이트 토글 클릭 시 theme state가 light로 변경된다', async () => {
    useAuthStore.setState({ token: null, user: null, theme: 'dark', language: 'ko' });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '라이트 모드로 전환' }));
    expect(useAuthStore.getState().theme).toBe('light');
  });

  it('로그인 상태에서 토글 클릭 시 saveTheme API를 호출한다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(mockSaveTheme).toHaveBeenCalledWith({ theme: 'dark' }, expect.objectContaining({ onError: expect.any(Function) }));
  });

  it('비로그인 상태에서 토글 클릭 시 saveTheme API를 호출하지 않는다', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(mockSaveTheme).not.toHaveBeenCalled();
  });

  it('API 저장 실패 시 에러 메시지를 표시한다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    mockSaveTheme.mockImplementation((_input: unknown, callbacks: { onError?: () => void }) => {
      callbacks?.onError?.();
    });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(screen.getByText('테마 저장에 실패했습니다.')).toBeInTheDocument();
  });
});

describe('Header — 언어 전환', () => {
  it('KO 버튼과 EN 버튼이 표시된다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '한국어로 전환' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '영어로 전환' })).toBeInTheDocument();
  });

  it('언어가 ko일 때 KO 버튼이 눌린 상태(aria-pressed=true)이다', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '한국어로 전환' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '영어로 전환' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('언어가 en일 때 EN 버튼이 눌린 상태(aria-pressed=true)이다', () => {
    useAuthStore.setState({ token: null, user: null, theme: 'light', language: 'en' });
    renderHeader();
    expect(screen.getByRole('button', { name: '영어로 전환' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '한국어로 전환' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('EN 버튼 클릭 시 language state가 en으로 변경된다', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '영어로 전환' }));
    expect(useAuthStore.getState().language).toBe('en');
  });

  it('EN 버튼 클릭 후 KO 클릭 시 language state가 ko로 변경된다', async () => {
    useAuthStore.setState({ token: null, user: null, theme: 'light', language: 'en' });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '한국어로 전환' }));
    expect(useAuthStore.getState().language).toBe('ko');
  });

  it('로그인 상태에서 EN 클릭 시 saveLanguage API를 호출한다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '영어로 전환' }));
    expect(mockSaveTheme).toHaveBeenCalledWith({ language: 'en' }, expect.objectContaining({ onError: expect.any(Function) }));
  });

  it('비로그인 상태에서 EN 클릭 시 API를 호출하지 않는다', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '영어로 전환' }));
    expect(mockSaveTheme).not.toHaveBeenCalled();
  });

  it('이미 선택된 언어 버튼 클릭 시 API를 호출하지 않는다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '한국어로 전환' }));
    expect(mockSaveTheme).not.toHaveBeenCalled();
  });

  it('언어 API 저장 실패 시 에러 메시지를 표시한다', async () => {
    useAuthStore.setState({ token: 'jwt-token', user: mockUser, theme: 'light', language: 'ko' });
    mockSaveTheme.mockImplementation((_input: unknown, callbacks: { onError?: () => void }) => {
      callbacks?.onError?.();
    });
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: '영어로 전환' }));
    await waitFor(() =>
      expect(screen.getByText('언어 저장에 실패했습니다.')).toBeInTheDocument()
    );
  });
});
