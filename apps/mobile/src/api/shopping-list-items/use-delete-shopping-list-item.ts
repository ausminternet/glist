import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { deleteShoppingListItem } from './delete-shopping-list-item'

export function useDeleteShoppingListItem() {
  const householdId = useHouseholdId()
  const querClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: (itemId: string) => deleteShoppingListItem(householdId, itemId),

    onMutate: async (itemId) => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await querClient.cancelQueries({ queryKey })

      const previousItems =
        querClient.getQueryData<ShoppingListItemView[]>(queryKey)

      querClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== itemId),
      )

      return { previousItems, queryKey }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousItems) {
        querClient.setQueryData(context.queryKey, context.previousItems)
      }
    },

    onSettled: () => {
      querClient.invalidateQueries({
        queryKey: queryKeys.shoppingListItems(householdId),
      })
    },
  })

  return { deleteShoppingListItem: mutate, ...rest }
}
