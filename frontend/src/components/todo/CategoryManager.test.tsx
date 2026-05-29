import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryManager } from './CategoryManager';
import type { Category } from '../../types/todo';

vi.mock('../../api/categoryApi', () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategories: vi.fn(),
}));

import { createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

const mockCategories: Category[] = [
  { id: 1, name: '기본', userId: 1 },
  { id: 2, name: '업무', userId: 1 },
  { id: 3, name: '개인', userId: 1 },
];

function renderComponent(categories = mockCategories) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CategoryManager categories={categories} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CategoryManager', () => {
  it('카테고리 목록을 렌더링한다', () => {
    renderComponent();
    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
    expect(screen.getByText('개인')).toBeInTheDocument();
  });

  it('"기본" 카테고리에는 수정·삭제 버튼이 없다', () => {
    renderComponent();
    expect(screen.queryByLabelText('기본 수정')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('기본 삭제')).not.toBeInTheDocument();
  });

  it('일반 카테고리에는 수정·삭제 버튼이 있다', () => {
    renderComponent();
    expect(screen.getByLabelText('업무 수정')).toBeInTheDocument();
    expect(screen.getByLabelText('업무 삭제')).toBeInTheDocument();
  });

  it('새 카테고리를 추가한다', async () => {
    vi.mocked(createCategory).mockResolvedValueOnce({ id: 4, name: '공부', userId: 1 });
    renderComponent();

    await userEvent.type(screen.getByPlaceholderText('새 카테고리 이름'), '공부');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() =>
      expect(createCategory).toHaveBeenCalledWith({ name: '공부' })
    );
  });

  it('이름이 비어있으면 추가 버튼이 비활성화된다', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
  });

  it('수정 버튼 클릭 시 인라인 편집 입력창이 표시된다', async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText('업무 수정'));
    expect(screen.getByDisplayValue('업무')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('카테고리 이름을 수정하고 저장한다', async () => {
    vi.mocked(updateCategory).mockResolvedValueOnce({ id: 2, name: '업무2', userId: 1 });
    renderComponent();

    await userEvent.click(screen.getByLabelText('업무 수정'));
    const input = screen.getByDisplayValue('업무');
    await userEvent.clear(input);
    await userEvent.type(input, '업무2');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() =>
      expect(updateCategory).toHaveBeenCalledWith(2, { name: '업무2' })
    );
  });

  it('취소 버튼 클릭 시 편집 모드가 종료된다', async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText('업무 수정'));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('button', { name: '저장' })).not.toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 확인 모달이 표시된다', async () => {
    renderComponent();
    await userEvent.click(screen.getByLabelText('업무 삭제'));
    expect(screen.getByText('"업무" 카테고리를 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('모달에서 삭제 확인 시 deleteCategory가 호출된다', async () => {
    vi.mocked(deleteCategory).mockResolvedValueOnce(undefined);
    renderComponent();

    await userEvent.click(screen.getByLabelText('업무 삭제'));
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() =>
      expect(deleteCategory).toHaveBeenCalledWith(2)
    );
  });
});
