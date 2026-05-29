import { useState } from 'react';
import type { Category } from '../../types/todo';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategoryMutations';
import { Modal } from '../common/Modal';
import styles from './CategoryManager.module.css';

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory({ name: newName.trim() }, { onSuccess: () => setNewName('') });
  };

  const handleEditStart = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleEditSave = (id: number) => {
    if (!editingName.trim()) return;
    updateCategory(
      { id, input: { name: editingName.trim() } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    deleteCategory(deletingId, { onSuccess: () => setDeletingId(null) });
  };

  const deletingCategory = categories.find((c) => c.id === deletingId);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>카테고리 관리</h2>

      <ul className={styles.list}>
        {categories.map((cat) => (
          <li key={cat.id} className={styles.item}>
            {editingId === cat.id ? (
              <input
                className={styles.editInput}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave(cat.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                maxLength={30}
                autoFocus
              />
            ) : (
              <span className={styles.name}>{cat.name}</span>
            )}

            <div className={styles.actions}>
              {editingId === cat.id ? (
                <>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleEditSave(cat.id)}
                    disabled={isUpdating || !editingName.trim()}
                  >
                    저장
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </button>
                </>
              ) : (
                cat.name !== '기본' && (
                  <>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditStart(cat)}
                      aria-label={`${cat.name} 수정`}
                    >
                      ✎
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeletingId(cat.id)}
                      aria-label={`${cat.name} 삭제`}
                    >
                      ✕
                    </button>
                  </>
                )
              )}
            </div>
          </li>
        ))}
      </ul>

      <form className={styles.addForm} onSubmit={handleCreate}>
        <input
          className={styles.addInput}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름"
          maxLength={30}
        />
        <button
          type="submit"
          className={styles.addBtn}
          disabled={isCreating || !newName.trim()}
        >
          추가
        </button>
      </form>

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="카테고리 삭제"
        confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
        onConfirm={handleDeleteConfirm}
        confirmVariant="danger"
      >
        <p>"{deletingCategory?.name}" 카테고리를 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
}
