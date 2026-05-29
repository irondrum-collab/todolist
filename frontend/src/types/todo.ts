export type TodoStatus = '시작 전' | '진행 중' | '완료' | '기한 초과' | '진행 중 (날짜 없음)';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isCompleted: boolean;
  status: TodoStatus;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  categoryId?: number;
  startDate?: string | null;
  endDate?: string | null;
  isCompleted?: boolean;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

export interface TodoFilters {
  categoryId?: number;
  status?: TodoStatus | '전체';
}
