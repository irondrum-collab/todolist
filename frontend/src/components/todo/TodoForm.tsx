import { useState, useEffect } from 'react';
import type { Todo, Category, CreateTodoInput, UpdateTodoInput } from '../../types/todo';
import { useCreateTodo, useUpdateTodo } from '../../hooks/useTodoMutations';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  editingTodo?: Todo | null;
  categories: Category[];
  onCancel?: () => void;
}

const EMPTY: CreateTodoInput = {
  title: '',
  description: '',
  categoryId: undefined,
  startDate: '',
  endDate: '',
};

export function TodoForm({ editingTodo, categories, onCancel }: TodoFormProps) {
  const { mutate: createTodo, isPending: isCreating } = useCreateTodo();
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const isPending = isCreating || isUpdating;

  const [form, setForm] = useState<CreateTodoInput & { isCompleted?: boolean }>(EMPTY);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (editingTodo) {
      setForm({
        title: editingTodo.title,
        description: editingTodo.description ?? '',
        categoryId: editingTodo.categoryId,
        startDate: editingTodo.startDate ?? '',
        endDate: editingTodo.endDate ?? '',
        isCompleted: editingTodo.isCompleted,
      });
    } else {
      setForm(EMPTY);
    }
    setDateError('');
  }, [editingTodo]);

  const validate = () => {
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setDateError('종료일자는 시작일자 이후여야 합니다');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      categoryId: form.categoryId,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    if (editingTodo) {
      const updatePayload: UpdateTodoInput = {
        ...payload,
        isCompleted: form.isCompleted,
      };
      updateTodo(
        { id: editingTodo.id, input: updatePayload },
        { onSuccess: () => { onCancel?.(); } }
      );
    } else {
      createTodo(payload as CreateTodoInput, { onSuccess: () => setForm(EMPTY) });
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setDateError('');
    onCancel?.();
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{editingTodo ? '할 일 수정' : '새 할 일 등록'}</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="제목 *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="제목을 입력하세요 (최대 100자)"
          maxLength={100}
          required
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="todo-desc">설명</label>
          <textarea
            id="todo-desc"
            className={styles.textarea}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="설명을 입력하세요 (선택, 최대 1000자)"
            maxLength={1000}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="todo-category">카테고리</label>
          <select
            id="todo-category"
            className={styles.select}
            value={form.categoryId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))
            }
          >
            <option value="">기본</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-start">시작일</label>
            <input
              id="todo-start"
              type="date"
              className={styles.dateInput}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-end">종료일</label>
            <input
              id="todo-end"
              type="date"
              className={`${styles.dateInput} ${dateError ? styles.error : ''}`}
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
        </div>
        {dateError && <span className={styles.errorText}>{dateError}</span>}
        {editingTodo && (
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.isCompleted ?? false}
              onChange={(e) => setForm((f) => ({ ...f, isCompleted: e.target.checked }))}
            />
            완료로 표시
          </label>
        )}
        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={handleReset}>
            {editingTodo ? '취소' : '초기화'}
          </Button>
          <Button type="submit" loading={isPending}>
            저장
          </Button>
        </div>
      </form>
    </div>
  );
}
