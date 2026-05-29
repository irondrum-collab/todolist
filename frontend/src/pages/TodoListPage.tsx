import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCategories } from '../hooks/useCategories';
import { Header } from '../components/layout/Header';
import { TodoFilter } from '../components/todo/TodoFilter';
import { TodoList } from '../components/todo/TodoList';
import { TodoForm } from '../components/todo/TodoForm';
import { Modal } from '../components/common/Modal';
import type { Todo, TodoFilters, TodoStatus } from '../types/todo';
import styles from './TodoListPage.module.css';

export function TodoListPage() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<TodoFilters & { status?: TodoStatus | '전체' }>({});
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showFilterMobile, setShowFilterMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  const { data: categories = [] } = useCategories();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {/* 사이드바: 필터 */}
        <aside className={styles.sidebar}>
          <button
            className={styles.mobileFilterToggle}
            onClick={() => setShowFilterMobile((v) => !v)}
          >
            {showFilterMobile ? '▲ 필터 접기' : '▼ 필터 펼치기'}
          </button>
          {(showFilterMobile || true) && (
            <div style={{ display: showFilterMobile ? 'block' : 'none' }} className="mobile-filter">
              <TodoFilter filters={filters} categories={categories} onChange={setFilters} />
            </div>
          )}
          <div className="desktop-filter">
            <TodoFilter filters={filters} categories={categories} onChange={setFilters} />
          </div>
        </aside>

        {/* 메인 컨텐츠 */}
        <div className={styles.content}>
          <div className={styles.formPanel}>
            <TodoForm
              editingTodo={editingTodo}
              categories={categories}
              onCancel={() => setEditingTodo(null)}
            />
          </div>
          <TodoList filters={filters} categories={categories} onEdit={setEditingTodo} />
        </div>
      </main>

      {/* 모바일 FAB */}
      <button className={styles.fab} onClick={() => setShowFormModal(true)} aria-label="할 일 추가">
        +
      </button>

      {/* 모바일 폼 모달 */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)}>
        <TodoForm
          categories={categories}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>
    </div>
  );
}
