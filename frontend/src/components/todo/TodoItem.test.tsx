import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { TodoItem } from './TodoItem';
import type { Todo, Category } from '../../types/todo';

// useTodoMutations 모킹
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('../../hooks/useTodoMutations', () => ({
  useUpdateTodo: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useDeleteTodo: () => ({ mutate: mockDeleteMutate, isPending: false }),
}));

const mockCategories: Category[] = [
  { id: 1, name: '기본', userId: 1 },
  { id: 2, name: '업무', userId: 1 },
];

const baseTodo: Todo = {
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

function renderTodoItem(todo: Todo, onEdit = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TodoItem todo={todo} categories={mockCategories} onEdit={onEdit} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TodoItem', () => {
  beforeEach(() => {
    mockUpdateMutate.mockReset();
    mockDeleteMutate.mockReset();
  });

  it('제목, 상태 배지, 날짜를 렌더링한다', () => {
    renderTodoItem(baseTodo);

    expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    // 날짜 범위 텍스트가 DOM에 존재하는지 확인
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it.each([
    ['완료', { isCompleted: true, startDate: '2026-01-01', endDate: '2099-12-31' }],
    ['진행 중 (날짜 없음)', { isCompleted: false, startDate: null, endDate: null }],
    ['시작 전', { isCompleted: false, startDate: '2099-01-01', endDate: '2099-12-31' }],
    ['진행 중', { isCompleted: false, startDate: '2026-01-01', endDate: '2099-12-31' }],
    ['기한 초과', { isCompleted: false, startDate: '2020-01-01', endDate: '2020-12-31' }],
  ] as const)('상태 배지 "%s"가 올바르게 표시된다', (expectedStatus, overrides) => {
    const todo: Todo = { ...baseTodo, ...overrides, status: expectedStatus };
    renderTodoItem(todo);

    expect(screen.getByText(expectedStatus)).toBeInTheDocument();
  });

  it('완료 상태일 때 title에 completed CSS 클래스가 있다', () => {
    const completedTodo: Todo = {
      ...baseTodo,
      isCompleted: true,
      status: '완료',
    };
    renderTodoItem(completedTodo);

    const titleEl = screen.getByText('테스트 할 일');
    expect(titleEl.className).toMatch(/completed/);
  });

  it('수정 버튼 클릭 시 onEdit을 todo와 함께 호출한다', () => {
    const onEdit = vi.fn();
    renderTodoItem(baseTodo, onEdit);

    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });

  it('삭제 버튼 클릭 시 삭제 확인 모달이 열린다', () => {
    renderTodoItem(baseTodo);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('삭제 모달에서 확인 버튼 클릭 시 deleteTodo mutate가 호출된다', () => {
    renderTodoItem(baseTodo);

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    // 모달 내부의 '삭제' 버튼 (confirmLabel)
    const modalDeleteBtn = screen.getAllByRole('button', { name: '삭제' }).at(-1)!;
    fireEvent.click(modalDeleteBtn);

    expect(mockDeleteMutate).toHaveBeenCalledWith(baseTodo.id, expect.any(Object));
  });

  it('체크박스 클릭 시 updateTodo mutate가 isCompleted 반전값으로 호출된다', () => {
    renderTodoItem(baseTodo);

    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: baseTodo.id,
      input: { isCompleted: !baseTodo.isCompleted },
    });
  });
});
