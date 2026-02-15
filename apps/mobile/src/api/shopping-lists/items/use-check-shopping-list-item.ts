import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../query-keys'
import { checkShoppingListItem } from './check-shopping-list-item'

type CheckShoppingListItemParams = {
  householdId: string
  listId: string
  itemId: string
}

export function useCheckShoppingListItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      householdId,
      listId,
      itemId,
    }: CheckShoppingListItemParams) =>
      checkShoppingListItem(householdId, listId, itemId),

    onMutate: async ({ householdId, listId, itemId }) => {
      const queryKey = queryKeys.shoppingListItems(householdId, listId)

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

    onSettled: (_data, _error, { householdId, listId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingListItems(householdId, listId),
      })
    },
  })
}
