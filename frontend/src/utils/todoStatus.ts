import type { Todo, TodoStatus } from '../types/todo';

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calcTodoStatus(todo: Pick<Todo, 'isCompleted' | 'startDate' | 'endDate'>): TodoStatus {
  if (todo.isCompleted) return '완료';

  if (todo.startDate === null && todo.endDate === null) return '진행 중 (날짜 없음)';

  const today = getTodayStr();

  if (todo.endDate && today > todo.endDate) return '기한 초과';
  if (todo.startDate && today < todo.startDate) return '시작 전';

  return '진행 중';
}
