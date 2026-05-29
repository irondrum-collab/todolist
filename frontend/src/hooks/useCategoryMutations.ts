import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import { CATEGORY_QUERY_KEY } from './useCategories';
import type { CreateCategoryInput, UpdateCategoryInput } from '../types/todo';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] }); },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCategoryInput }) => updateCategory(id, input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] }); },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
