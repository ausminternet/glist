import type { AddInventoryItemInput } from '@glist/schemas'
import type { InventoryItemView } from '@glist/views'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHouseholdId } from '@/hooks/use-household-id'
import { generateUUID } from '@/utils/generate-uuid'
import { queryKeys } from '../query-keys'
import { addInventoryItem } from './add-inventory-item'

export function useAddInventoryItem() {
  const queryClient = useQueryClient()
  const householdId = useHouseholdId()

  const { mutate, ...rest } = useMutation({
    mutationFn: (item: AddInventoryItemInput) =>
      addInventoryItem(item, householdId),
    onMutate: async (item) => {
      const queryKey = queryKeys.inventoryItems(householdId)

      await queryClient.cancelQueries({ queryKey })

      const previousItems =
        queryClient.getQueryData<InventoryItemView[]>(queryKey)

      queryClient.setQueryData<InventoryItemView[]>(queryKey, (old) => {
        const newItem: InventoryItemView = {
          id: `temp-${generateUUID()}`,
          name: item.name,
          description: item.description ?? null,
          categoryId: item.categoryId ?? null,
          targetStock: item.targetStock ?? null,
          targetStockUnit: item.targetStockUnit ?? null,
          basePriceCents: item.basePriceCents ?? null,
          basePriceUnit: item.basePriceUnit ?? null,
          shopIds: item.shopIds ?? [],
          householdId,
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventoryItems(householdId),
      })
    },
  })

  return { addInventoryItem: mutate, ...rest }
}
