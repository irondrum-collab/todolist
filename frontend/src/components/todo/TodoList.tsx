import type { Category, TodoFilters, TodoStatus } from '../../types/todo';
import { useTodos } from '../../hooks/useTodos';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo';
import styles from './TodoList.module.css';

interface TodoListProps {
  filters: TodoFilters & { status?: TodoStatus | '전체' };
  categories: Category[];
  onEdit: (todo: Todo) => void;
}

export function TodoList({ filters, categories, onEdit }: TodoListProps) {
  const { data: todos = [], isLoading, isError } = useTodos(filters);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>불러오는 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>할 일 목록 ({todos.length}건)</div>
      {todos.length === 0 ? (
        <div className={styles.empty}>등록된 할 일이 없습니다</div>
      ) : (
        todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} categories={categories} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}
