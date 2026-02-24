import type { EditShoppingListItemInput } from '@glist/schemas'
import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { editShoppingListItem } from './edit-shopping-list-item'

interface MutateProps {
  itemId: string
  payload: EditShoppingListItemInput
}

export function useEditShoppingListItem() {
  const householdId = useHouseholdId()
  const queryClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: (variables: MutateProps) =>
      editShoppingListItem(variables.itemId, variables.payload, householdId),
    onMutate: async (variables) => {
      const queryKey = queryKeys.shoppingListItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<ShoppingListItemView[]>(queryKey)

      queryClient.setQueryData<ShoppingListItemView[]>(queryKey, (old) => {
        const oldItem = old?.find((item) => item.id === variables.itemId)

        if (!oldItem) {
          throw new Error('Item to edit was not found in query cache')
        }

        const newItem: ShoppingListItemView = {
          ...oldItem,
          ...variables.payload,
        }

        if (!old) return [newItem]
        return old?.map((item) => (item.id === newItem.id ? newItem : item))
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

  return { editShoppingListItem: mutate, ...rest }
}
