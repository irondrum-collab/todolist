import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todoApi';
import type { TodoFilters } from '../types/todo';

export const TODO_QUERY_KEY = 'todos';

export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: [TODO_QUERY_KEY, filters],
    queryFn: () => getTodos(filters),
  });
}
