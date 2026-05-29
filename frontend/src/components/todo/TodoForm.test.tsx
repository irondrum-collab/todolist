import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TodoForm } from './TodoForm';
import type { Todo, Category } from '../../types/todo';

// useTodoMutations 모킹
const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

vi.mock('../../hooks/useTodoMutations', () => ({
  useCreateTodo: () => ({ mutate: mockCreateMutate, isPending: false }),
  useUpdateTodo: () => ({ mutate: mockUpdateMutate, isPending: false }),
}));

const mockCategories: Category[] = [
  { id: 1, name: '기본', userId: 1 },
  { id: 2, name: '업무', userId: 1 },
];

const mockTodo: Todo = {
  id: 1,
  title: '테스트 할 일',
  description: null,
  startDate: '2026-05-01',
  endDate: '2026-06-01',
  isCompleted: false,
  status: '진행 중',
  categoryId: 1,
  userId: 1,
  createdAt: '2026-05-29T00:00:00Z',
  updatedAt: '2026-05-29T00:00:00Z',
};

function renderTodoForm(props: Partial<Parameters<typeof TodoForm>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TodoForm categories={mockCategories} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TodoForm', () => {
  beforeEach(() => {
    mockCreateMutate.mockReset();
    mockUpdateMutate.mockReset();
  });

  it('기본 렌더링: 제목 입력, 설명 입력, 카테고리 select, 시작일, 종료일 필드가 있다', () => {
    renderTodoForm();

    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료일')).toBeInTheDocument();
  });

  it('editingTodo가 없을 때 "새 할 일 등록" 제목을 표시한다', () => {
    renderTodoForm();

    expect(screen.getByText('새 할 일 등록')).toBeInTheDocument();
  });

  it('editingTodo가 있으면 "할 일 수정" 제목을 표시하고 기존 데이터를 미리 채운다', () => {
    renderTodoForm({ editingTodo: mockTodo });

    expect(screen.getByText('할 일 수정')).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLInputElement>(/제목/).value).toBe(mockTodo.title);
    expect(screen.getByLabelText<HTMLInputElement>('시작일').value).toBe(mockTodo.startDate);
    expect(screen.getByLabelText<HTMLInputElement>('종료일').value).toBe(mockTodo.endDate);
  });

  it('제목 미입력 시 createTodo가 호출되지 않는다', () => {
    renderTodoForm();

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('종료일 < 시작일 입력 시 "종료일자는 시작일자 이후여야 합니다" 오류 메시지를 표시한다', () => {
    renderTodoForm();

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '제목' } });
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2026-05-01' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('종료일자는 시작일자 이후여야 합니다')).toBeInTheDocument();
    expect(mockCreateMutate).not.toHaveBeenCalled();
  });

  it('유효한 폼 제출 시 createTodo가 올바른 payload로 호출된다', () => {
    renderTodoForm();

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '새 할 일' } });
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2026-06-01' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '새 할 일',
        startDate: '2026-05-01',
        endDate: '2026-06-01',
      }),
      expect.any(Object)
    );
  });

  it('수정 모드에서 유효한 폼 제출 시 updateTodo가 호출된다', () => {
    const onCancel = vi.fn();
    renderTodoForm({ editingTodo: mockTodo, onCancel });

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '수정된 제목' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockTodo.id,
        input: expect.objectContaining({ title: '수정된 제목' }),
      }),
      expect.any(Object)
    );
  });

  it('초기화/취소 버튼 클릭 시 onCancel이 호출된다', () => {
    const onCancel = vi.fn();
    renderTodoForm({ onCancel });

    fireEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('수정 모드에서 취소 버튼 클릭 시 onCancel이 호출된다', () => {
    const onCancel = vi.fn();
    renderTodoForm({ editingTodo: mockTodo, onCancel });

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
