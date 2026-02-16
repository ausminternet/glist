import { describe, expect, mock, test } from 'bun:test'
import { parseHouseholdId } from '@/domain/household/household-id'
import { InventoryItem } from '@/domain/inventory-item/inventory-item'
import { generateInventoryItemId } from '@/domain/inventory-item/inventory-item-id'
import type { InventoryItemRepository } from '@/domain/inventory-item/inventory-item-repository'
import {
  type ReplaceInventoryItemCommand,
  ReplaceInventoryItemCommandHandler,
} from './replace-inventory-item'

function createTestInventoryItem(householdId: string) {
  const result = InventoryItem.create(
    generateInventoryItemId(),
    parseHouseholdId(householdId),
    {
      name: 'Milk',
      description: 'Original description',
      targetStock: 1,
      targetStockUnit: 'l',
    },
  )
  if (!result.ok) throw new Error('Failed to create test item')
  return result.value
}

function createMockRepository(
  item: InventoryItem | null,
): InventoryItemRepository {
  return {
    findById: mock(() => Promise.resolve(item)),
    findAllByHouseholdId: mock(() => Promise.resolve([])),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  }
}

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
  const householdId = '00000000-0000-0000-0000-000000000001'

  test('replaces item successfully', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    const result = await handler.execute({
      ...validCommand,
      inventoryItemId: item.id,
    })

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
    expect(item.targetStock).toBe(2)
    expect(item.basePriceCents).toBe(199)
  })

  test('returns INVENTORY_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockRepository(null)
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    const result = await handler.execute({
      ...validCommand,
      inventoryItemId: 'non-existent-id',
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('INVENTORY_ITEM_NOT_FOUND')
    if (result.error.type === 'INVENTORY_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-id')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
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

    const result = await handler.execute(command)

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.targetStock).toBeNull()
    expect(item.targetStockUnit).toBeNull()
    expect(item.basePriceCents).toBeNull()
    expect(item.basePriceUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const item = createTestInventoryItem(householdId)
    const repository = createMockRepository(item)
    const handler = new ReplaceInventoryItemCommandHandler(repository)

    expect(item.updatedAt).toBeNull()

    const result = await handler.execute({
      ...validCommand,
      inventoryItemId: item.id,
    })

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})
