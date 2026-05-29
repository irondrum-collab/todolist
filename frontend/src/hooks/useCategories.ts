import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categoryApi';

export const CATEGORY_QUERY_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEY],
    queryFn: getCategories,
  });
}
