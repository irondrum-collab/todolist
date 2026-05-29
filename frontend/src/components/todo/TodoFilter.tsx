import { useTranslation } from 'react-i18next';
import type { Category, TodoFilters, TodoStatus } from '../../types/todo';
import styles from './TodoFilter.module.css';

const STATUS_VALUES: Array<TodoStatus | '전체'> = [
  '전체', '시작 전', '진행 중', '완료', '기한 초과', '진행 중 (날짜 없음)',
];

interface TodoFilterProps {
  filters: TodoFilters & { status?: TodoStatus | '전체' };
  categories: Category[];
  onChange: (filters: TodoFilters & { status?: TodoStatus | '전체' }) => void;
}

export function TodoFilter({ filters, categories, onChange }: TodoFilterProps) {
  const { t } = useTranslation();

  const statusLabel: Record<string, string> = {
    '전체': t('filter.all'),
    '시작 전': t('status.not_started'),
    '진행 중': t('status.in_progress'),
    '완료': t('status.completed'),
    '기한 초과': t('status.overdue'),
    '진행 중 (날짜 없음)': t('status.no_date'),
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>{t('filter.title')}</h2>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-category">{t('filter.category')}</label>
        <select
          id="filter-category"
          className={styles.select}
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            onChange({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">{t('filter.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="filter-status">{t('filter.status')}</label>
        <select
          id="filter-status"
          className={styles.select}
          value={filters.status ?? '전체'}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as TodoStatus | '전체' })
          }
        >
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
