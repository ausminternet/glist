import type { AddShoppingListItemInput } from '@glist/schemas'
import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { generateUUID } from '@/utils/generate-uuid'
import { queryKeys } from '../query-keys'
import { addShoppingListItem } from './add-shopping-list-item'

export function useSaveShoppingListItem() {
  const queryClient = useQueryClient()
  const householdId = useHouseholdId()

  const { mutate, ...rest } = useMutation({
    mutationFn: (item: AddShoppingListItemInput) =>
      addShoppingListItem(item, householdId),
    onMutate: async (item) => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<ShoppingListItemView[]>(queryKey)

      queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) => {
        const newItem: ShoppingListItemView = {
          ...item,
          id: `temp-${generateUUID()}`,
          description: item.description ?? null,
          categoryId: item.categoryId ?? null,
          quantity: item.quantity ?? null,
          quantityUnit: item.quantityUnit ?? null,
          shopIds: item.shopIds ?? [],
          inventoryItemId: item.inventoryItemId ?? null,
          householdId,
          checked: false,
          createdAt: Date.now().toString(),
          updatedAt: null,
          photoUrl: null,
        }

        if (!old) return [newItem]
        return [...old, newItem]
      })
      return { previousItems, queryKey }
    },
    onError: (_error, _item, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(context.queryKey, context.previousItems)
      }

      // onError?.(error)
    },
    // onSuccess: (itemId) => {
    //   onSuccess?.(itemId)
    // },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingListItems(householdId),
      })
    },
  })

  return { addShoppingListItem: mutate, ...rest }
}
