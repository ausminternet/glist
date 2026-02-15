import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { getCategories } from './get-categories'

export function useCategories(householdId: string) {
  const { data = [], ...rest } = useQuery({
    queryKey: queryKeys.categories(householdId),
    queryFn: () => getCategories(householdId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const getCategory = (categoryId: string) => {
    return data.find((category) => category.id === categoryId)
  }

  const getCategoryName = (categoryId: string) => {
    const category = getCategory(categoryId)
    return category ? category.name : 'Unknown'
  }

  return { categories: data, ...rest, getCategory, getCategoryName }
}
