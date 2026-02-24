import type { EditInventoryItemInput } from '@glist/schemas'
import type { InventoryItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { editInventoryItem } from './edit-inventory-item'

interface MutateProps {
  itemId: string
  payload: EditInventoryItemInput
}

export function useEditInventoryItem() {
  const householdId = useHouseholdId()
  const queryClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: (variables: MutateProps) =>
      editInventoryItem(variables.itemId, variables.payload, householdId),
    onMutate: async (variables) => {
      const queryKey = queryKeys.inventoryItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<InventoryItemView[]>(queryKey)

      queryClient.setQueryData<InventoryItemView[]>(queryKey, (old) => {
        const oldItem = old?.find((item) => item.id === variables.itemId)

        if (!oldItem) {
          throw new Error('Item to edit was not found in query cache')
        }

        const newItem: InventoryItemView = {
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventoryItems(householdId),
      })
    },
  })

  return { editInventoryItem: mutate, ...rest }
}
