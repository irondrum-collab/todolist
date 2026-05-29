import type { Category, TodoFilters, TodoStatus } from '../../types/todo';
import styles from './TodoFilter.module.css';

const STATUS_OPTIONS: Array<TodoStatus | '전체'> = [
  '전체', '시작 전', '진행 중', '완료', '기한 초과', '진행 중 (날짜 없음)',
];

interface TodoFilterProps {
  filters: TodoFilters & { status?: TodoStatus | '전체' };
  categories: Category[];
  onChange: (filters: TodoFilters & { status?: TodoStatus | '전체' }) => void;
}

export function TodoFilter({ filters, categories, onChange }: TodoFilterProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>필터</h2>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-category">카테고리</label>
        <select
          id="filter-category"
          className={styles.select}
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            onChange({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">전체</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-status">상태</label>
        <select
          id="filter-status"
          className={styles.select}
          value={filters.status ?? '전체'}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as TodoStatus | '전체' })
          }
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
