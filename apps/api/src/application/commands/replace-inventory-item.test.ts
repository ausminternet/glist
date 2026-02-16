import { beforeEach, describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import type { InventoryItem } from '@/domain/inventory-item/inventory-item'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import {
  createMockInventoryItemRepository,
  createTestInventoryItem,
} from '@/test'
import {
  type ReplaceInventoryItemCommand,
  ReplaceInventoryItemCommandHandler,
} from './replace-inventory-item'

const householdId = generateHouseholdId()

const validCommand: Omit<ReplaceInventoryItemCommand, 'inventoryItemId'> = {
  name: 'Updated Milk',
  description: 'Updated description',
  categoryId: null,
  targetStock: 2,
  targetStockUnit: 'l',
  basePriceCents: 199,
  basePriceUnit: 'l',
  shopIds: [],
}

describe('ReplaceInventoryItemCommandHandler', () => {
  let item: InventoryItem
  let repository: InventoryItemRepository
  let handler: ReplaceInventoryItemCommandHandler

  beforeEach(() => {
    item = createTestInventoryItem({ householdId, name: 'Milk' })
    repository = createMockInventoryItemRepository([item])
    handler = new ReplaceInventoryItemCommandHandler(repository)
  })

  test('replaces item successfully', async () => {
    const result = await handler.execute(
      { ...validCommand, inventoryItemId: item.id },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const result = await handler.execute(
      { ...validCommand, inventoryItemId: 'non-existent-id' },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const command: ReplaceInventoryItemCommand = {
      inventoryItemId: item.id,
      name: 'Simple Item',
      description: null,
      categoryId: null,
      targetStock: null,
      targetStockUnit: null,
      basePriceCents: null,
      basePriceUnit: null,
      shopIds: [],
    }

    const result = await handler.execute(command, { householdId })

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.targetStock).toBeNull()
    expect(item.basePriceCents).toBeNull()
  })
})
