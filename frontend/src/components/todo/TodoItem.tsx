import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Todo, Category, TodoStatus } from '../../types/todo';
import { calcTodoStatus } from '../../utils/todoStatus';
import { formatDateRange } from '../../utils/dateFormatter';
import { useUpdateTodo, useDeleteTodo } from '../../hooks/useTodoMutations';
import { Modal } from '../common/Modal';
import styles from './TodoItem.module.css';

const STATUS_BADGE_CLASS: Record<string, string> = {
  '시작 전': styles.badge_시작전,
  '진행 중': styles.badge_진행중,
  '완료': styles.badge_완료,
  '기한 초과': styles.badge_기한초과,
  '진행 중 (날짜 없음)': styles.badge_날짜없음,
};

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, categories, onEdit }: TodoItemProps) {
  const { t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: updateTodo } = useUpdateTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const status = calcTodoStatus(todo);
  const category = categories.find((c) => c.id === todo.categoryId);
  const dateRange = formatDateRange(todo.startDate, todo.endDate);

  const statusLabelMap: Record<TodoStatus, string> = {
    '시작 전': t('status.not_started'),
    '진행 중': t('status.in_progress'),
    '완료': t('status.completed'),
    '기한 초과': t('status.overdue'),
    '진행 중 (날짜 없음)': t('status.no_date'),
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTodo({ id: todo.id, input: { isCompleted: !todo.isCompleted } });
  };

  const handleDelete = () => {
    deleteTodo(todo.id, { onSuccess: () => setShowDeleteModal(false) });
  };

  return (
    <>
      <div className={styles.row}>
        <button
          className={`${styles.checkbox} ${todo.isCompleted ? styles.checked : ''}`}
          onClick={handleToggle}
          aria-label={todo.isCompleted ? t('todo.uncomplete_btn') : t('todo.complete_btn')}
        >
          {todo.isCompleted && <span className={styles.checkMark}>✓</span>}
        </button>
        <span className={`${styles.title} ${todo.isCompleted ? styles.completed : ''}`}>
          {todo.title}
        </span>
        <div className={styles.meta}>
          {category && (
            <span className={styles.badge} style={{ color: 'var(--color-text-secondary, #5f6368)', background: 'var(--color-hover, #f1f3f4)' }}>
              {category.name}
            </span>
          )}
          <span className={`${styles.badge} ${STATUS_BADGE_CLASS[status] ?? ''}`}>
            {statusLabelMap[status] ?? status}
          </span>
          <span className={styles.date}>{dateRange}</span>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
            aria-label={t('todo.edit_btn')}
          >
            {t('todo.edit_btn')}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
            aria-label={t('todo.delete_btn')}
          >
            {t('todo.delete_btn')}
          </button>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('todo.delete_confirm_title')}
        confirmLabel={isDeleting ? t('todo.deleting') : t('todo.delete_btn')}
        onConfirm={handleDelete}
        confirmVariant="danger"
      >
        <p>"{todo.title}"</p>
        <p>{t('todo.delete_confirm_msg')}</p>
      </Modal>
    </>
  );
}
