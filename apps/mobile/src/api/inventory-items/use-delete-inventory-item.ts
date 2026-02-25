import type { InventoryItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { queryKeys } from '../query-keys'
import { deleteInventoryItem } from './delete-inventory-item'

export function useDeleteInventoryItem() {
  const householdId = useHouseholdId()
  const querClient = useQueryClient()

  const { mutate, ...rest } = useMutation({
    mutationFn: (itemId: string) => deleteInventoryItem(householdId, itemId),

    onMutate: async (itemId) => {
      const queryKey = queryKeys.inventoryItems(householdId)

      await querClient.cancelQueries({ queryKey })

      const previousItems =
        querClient.getQueryData<InventoryItemView[]>(queryKey)

      querClient.setQueryData<InventoryItemView[]>(queryKey, (old) =>
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
        queryKey: queryKeys.inventoryItems(householdId),
      })
    },
  })

  return { deleteInventoryItem: mutate, ...rest }
}
