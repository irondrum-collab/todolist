import { useState } from 'react';
import type { Todo, Category } from '../../types/todo';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: updateTodo } = useUpdateTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const status = calcTodoStatus(todo);
  const category = categories.find((c) => c.id === todo.categoryId);
  const dateRange = formatDateRange(todo.startDate, todo.endDate);

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
          aria-label={todo.isCompleted ? '완료 취소' : '완료'}
        >
          {todo.isCompleted && <span className={styles.checkMark}>✓</span>}
        </button>
        <span className={`${styles.title} ${todo.isCompleted ? styles.completed : ''}`}>
          {todo.title}
        </span>
        <div className={styles.meta}>
          {category && (
            <span className={styles.badge} style={{ color: '#5f6368', background: '#f1f3f4' }}>
              {category.name}
            </span>
          )}
          <span className={`${styles.badge} ${STATUS_BADGE_CLASS[status] ?? ''}`}>
            {status}
          </span>
          <span className={styles.date}>{dateRange}</span>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
            aria-label="수정"
          >
            수정
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
            aria-label="삭제"
          >
            삭제
          </button>
        </div>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="정말 삭제하시겠습니까?"
        confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
        onConfirm={handleDelete}
        confirmVariant="danger"
      >
        <p>"{todo.title}"</p>
        <p>이 작업은 되돌릴 수 없습니다.</p>
      </Modal>
    </>
  );
}
