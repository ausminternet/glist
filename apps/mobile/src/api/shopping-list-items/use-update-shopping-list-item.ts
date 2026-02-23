import type { UpdateShoppingListItemInput } from '@glist/schemas'
import type { ShoppingListItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { updateShoppingListItem } from './update-shopping-list-item'

// interface useSaveShoppingListItemOptions {
//   onSuccess?: (itemId: string) => void
//   onError?: (error: Error) => void
// }
//
interface MutateProps {
  itemId: string
  payload: UpdateShoppingListItemInput
}

export function useUpdateShoppingListItem(
  householdId: string,

  // options: useSaveShoppingListItemOptions = {},
) {
  const queryClient = useQueryClient()
  // const { onSuccess, onError } = options

  const { mutate, ...rest } = useMutation({
    mutationFn: (variables: MutateProps) =>
      updateShoppingListItem(variables.itemId, variables.payload, householdId),
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

  return { updateShoppingListItem: mutate, ...rest }
}
