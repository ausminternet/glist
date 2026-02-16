import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { checkShoppingListItem } from './check-shopping-list-item'

type CheckShoppingListItemParams = {
  householdId: string
  itemId: string
}

export function useCheckShoppingListItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ householdId, itemId }: CheckShoppingListItemParams) =>
      checkShoppingListItem(householdId, itemId),

    onMutate: async ({ householdId, itemId }) => {
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

    onSettled: (_data, _error, { householdId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingListItems(householdId),
      })
    },
  })
}
