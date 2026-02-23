import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { checkShoppingListItem } from './check-shopping-list-item'

export function useCheckShoppingListItem() {
  const householdId = useHouseholdId()
  const queryClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: (itemId: string) => checkShoppingListItem(householdId, itemId),

    onMutate: async (itemId) => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<ShoppingListItemView[]>(queryKey)

      queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, checked: true } : item,
        ),
      )

      return { previousItems, queryKey }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(context.queryKey, context.previousItems)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingListItems(householdId),
      })
    },
  })

  return { checkShoppingListItem: mutate, ...rest }
}
