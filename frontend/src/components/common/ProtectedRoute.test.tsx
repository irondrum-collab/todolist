import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { useAuthStore } from '../../store/authStore';

function renderRoute(
  component: React.ReactNode,
  path: string,
  initialPath: string
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={path} element={component} />
        <Route path="/login" element={<div>로그인 페이지</div>} />
        <Route path="/todos" element={<div>할 일 목록 페이지</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, user: null });
});

describe('ProtectedRoute', () => {
  it('비인증 시 /login으로 리다이렉트한다', () => {
    renderRoute(
      <ProtectedRoute><div>보호된 콘텐츠</div></ProtectedRoute>,
      '/todos',
      '/todos'
    );
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증 시 children을 렌더링한다', () => {
    useAuthStore.setState({ token: 'jwt-token', user: null });
    renderRoute(
      <ProtectedRoute><div>보호된 콘텐츠</div></ProtectedRoute>,
      '/todos',
      '/todos'
    );
    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  it('인증 시 /todos로 리다이렉트한다', () => {
    useAuthStore.setState({ token: 'jwt-token', user: null });
    renderRoute(
      <GuestRoute><div>게스트 전용 콘텐츠</div></GuestRoute>,
      '/login',
      '/login'
    );
    expect(screen.getByText('할 일 목록 페이지')).toBeInTheDocument();
    expect(screen.queryByText('게스트 전용 콘텐츠')).not.toBeInTheDocument();
  });

  it('비인증 시 children을 렌더링한다', () => {
    renderRoute(
      <GuestRoute><div>게스트 전용 콘텐츠</div></GuestRoute>,
      '/login',
      '/login'
    );
    expect(screen.getByText('게스트 전용 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('할 일 목록 페이지')).not.toBeInTheDocument();
  });
});
