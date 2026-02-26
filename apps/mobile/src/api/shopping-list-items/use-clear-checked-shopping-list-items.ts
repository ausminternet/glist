import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { clearCheckedShoppingListItems } from './clear-checked-shopping-list-items'

export function useClearCheckedShoppingListItems() {
  const householdId = useHouseholdId()
  const querClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: () => clearCheckedShoppingListItems(householdId),

    onMutate: async () => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await querClient.cancelQueries({ queryKey })

      const previousItems =
        querClient.getQueryData<ShoppingListItemView[]>(queryKey)

      querClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) =>
        old?.filter((item) => !item.checked),
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

  return { clearCheckedShoppingListItems: mutate, ...rest }
}
