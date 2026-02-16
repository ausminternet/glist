import { describe, expect, test } from 'bun:test'
import { generateHouseholdId } from '@/domain/household/household-id'
import {
  createMockInventoryItemRepository,
  createTestInventoryItem,
} from '@/test'
import {
  type ReplaceInventoryItemCommand,
  ReplaceInventoryItemCommandHandler,
} from './replace-inventory-item'

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

const householdId = generateHouseholdId()

describe('ReplaceInventoryItemCommandHandler', () => {
  test('replaces item successfully', async () => {
    const item = createTestInventoryItem({ householdId, name: 'Milk' })
    const repository = createMockInventoryItemRepository([item])
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        inventoryItemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
    expect(item.targetStock).toBe(2)
    expect(item.basePriceCents).toBe(199)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockInventoryItemRepository()
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        inventoryItemId: 'non-existent-id',
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    if (result.error.type === 'INVENTORY_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-id')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const item = createTestInventoryItem({ householdId, name: 'Milk' })
    const repository = createMockInventoryItemRepository([item])
    const handler = new ReplaceInventoryItemCommandHandler(repository)

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
    expect(item.targetStockUnit).toBeNull()
    expect(item.basePriceCents).toBeNull()
    expect(item.basePriceUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const item = createTestInventoryItem({ householdId, name: 'Milk' })
    const repository = createMockInventoryItemRepository([item])
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    expect(item.updatedAt).toBeNull()

    const result = await handler.execute(
      {
        ...validCommand,
        inventoryItemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})
