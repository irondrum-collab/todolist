import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { data: todos = [], isLoading, isError } = useTodos(filters);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>{t('todo.loading')}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>{t('todo.load_error')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>{t('todo.list_count', { count: todos.length })}</div>
      {todos.length === 0 ? (
        <div className={styles.empty}>{t('todo.empty')}</div>
      ) : (
        todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} categories={categories} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}
