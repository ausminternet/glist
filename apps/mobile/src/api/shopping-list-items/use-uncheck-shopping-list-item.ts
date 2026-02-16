import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { uncheckShoppingListItem } from './uncheck-shopping-list-item'

type UncheckShoppingListItemParams = {
  householdId: string
  itemId: string
}

export function useUncheckShoppingListItem() {
  const queryClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: ({ householdId, itemId }: UncheckShoppingListItemParams) =>
      uncheckShoppingListItem(householdId, itemId),

    onMutate: async ({ householdId, itemId }) => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<ShoppingListItemView[]>(queryKey)

      queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === itemId ? { ...item, checked: false } : item,
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

  return {
    uncheckShoppingListItem: mutate,
    ...rest,
  }
}
