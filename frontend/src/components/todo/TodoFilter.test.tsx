import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { TodoFilter } from './TodoFilter';
import type { Category, TodoFilters, TodoStatus } from '../../types/todo';

const mockCategories: Category[] = [
  { id: 1, name: '기본', userId: 1 },
  { id: 2, name: '업무', userId: 1 },
];

const defaultFilters: TodoFilters & { status?: TodoStatus | '전체' } = {
  categoryId: undefined,
  status: '전체',
};

describe('TodoFilter', () => {
  it('카테고리 select와 상태 select를 렌더링한다', () => {
    render(
      <TodoFilter filters={defaultFilters} categories={mockCategories} onChange={vi.fn()} />
    );

    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('상태')).toBeInTheDocument();
  });

  it('전체 카테고리 목록이 옵션에 표시된다', () => {
    render(
      <TodoFilter filters={defaultFilters} categories={mockCategories} onChange={vi.fn()} />
    );
    const catSelect = screen.getByLabelText('카테고리');
    expect(within(catSelect).getByRole('option', { name: '전체' })).toBeInTheDocument();
    expect(within(catSelect).getByRole('option', { name: '기본' })).toBeInTheDocument();
    expect(within(catSelect).getByRole('option', { name: '업무' })).toBeInTheDocument();
  });

  it('5가지 상태 옵션이 모두 표시된다', () => {
    render(
      <TodoFilter filters={defaultFilters} categories={mockCategories} onChange={vi.fn()} />
    );
    const statusSelect = screen.getByLabelText('상태');
    const statusOptions = ['전체', '시작 전', '진행 중', '완료', '기한 초과', '진행 중 (날짜 없음)'];
    statusOptions.forEach((status) => {
      expect(within(statusSelect).getByRole('option', { name: status })).toBeInTheDocument();
    });
  });

  it('카테고리 변경 시 onChange가 categoryId와 함께 호출된다', () => {
    const onChange = vi.fn();
    render(
      <TodoFilter filters={defaultFilters} categories={mockCategories} onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText('카테고리'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 2 })
    );
  });

  it('"전체" 카테고리 선택 시 categoryId가 undefined로 설정된다', () => {
    const onChange = vi.fn();
    render(
      <TodoFilter
        filters={{ ...defaultFilters, categoryId: 1 }}
        categories={mockCategories}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('카테고리'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: undefined })
    );
  });

  it('상태 변경 시 onChange가 status와 함께 호출된다', () => {
    const onChange = vi.fn();
    render(
      <TodoFilter filters={defaultFilters} categories={mockCategories} onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText('상태'), { target: { value: '진행 중' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: '진행 중' })
    );
  });
});
