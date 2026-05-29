import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setDateError(t('todo.date_error'));
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
      const updatePayload: UpdateTodoInput = { ...payload, isCompleted: form.isCompleted };
      updateTodo({ id: editingTodo.id, input: updatePayload }, { onSuccess: () => { onCancel?.(); } });
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
      <h2 className={styles.title}>{editingTodo ? t('todo.edit_title') : t('todo.new_title')}</h2>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label={t('todo.title_label')}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder={t('todo.title_placeholder')}
          maxLength={100}
          required
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="todo-desc">{t('todo.desc_label')}</label>
          <textarea
            id="todo-desc"
            className={styles.textarea}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('todo.desc_placeholder')}
            maxLength={1000}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="todo-category">{t('todo.category_label')}</label>
          <select
            id="todo-category"
            className={styles.select}
            value={form.categoryId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))
            }
          >
            <option value="">{t('todo.category_placeholder')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-start">{t('todo.start_date')}</label>
            <input
              id="todo-start"
              type="date"
              className={styles.dateInput}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="todo-end">{t('todo.end_date')}</label>
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
            {t('todo.mark_complete')}
          </label>
        )}
        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={handleReset}>
            {editingTodo ? t('todo.cancel_btn') : t('todo.reset_btn')}
          </Button>
          <Button type="submit" loading={isPending}>
            {t('todo.save_btn')}
          </Button>
        </div>
      </form>
    </div>
  );
}
