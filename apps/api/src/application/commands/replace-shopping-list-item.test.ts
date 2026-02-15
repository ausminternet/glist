import { describe, expect, mock, test } from 'bun:test'
import { Quantity } from '@/domain/shared/quantity'
import { parseShoppingListId } from '@/domain/shopping-list/shopping-list-id'
import {
  ShoppingListItem,
  type ShoppingListItemProps,
} from '@/domain/shopping-list-item/shopping-list-item'
import { generateShoppingListItemId } from '@/domain/shopping-list-item/shopping-list-item-id'
import type { ShoppingListItemRepository } from '@/domain/shopping-list-item/shopping-list-item-repository'
import {
  type ReplaceShoppingListItemCommand,
  ReplaceShoppingListItemCommandHandler,
} from './replace-shopping-list-item'

function createTestShoppingListItem(
  shoppingListId: string,
  options?: { name?: string; description?: string },
) {
  const quantityResult = Quantity.create(null, null)
  if (!quantityResult.ok) throw new Error('Failed to create quantity')

  const props: ShoppingListItemProps = {
    id: generateShoppingListItemId(),
    shoppingListId: parseShoppingListId(shoppingListId),
    inventoryItemId: null,
    name: options?.name ?? 'Milk',
    description: options?.description ?? null,
    categoryId: null,
    quantity: quantityResult.value,
    checked: false,
    shopIds: [],
    photoKey: null,
    createdAt: new Date(),
    updatedAt: null,
  }

  return new ShoppingListItem(props)
}

function createMockRepository(
  item: ShoppingListItem | null,
): ShoppingListItemRepository {
  return {
    findById: mock(() => Promise.resolve(item)),
    save: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    deleteCheckedByShoppingListId: mock(() => Promise.resolve()),
  }
}

const validCommand: Omit<
  ReplaceShoppingListItemCommand,
  'shoppingListId' | 'itemId'
> = {
  name: 'Updated Milk',
  description: 'Updated description',
  categoryId: null,
  quantity: 2,
  quantityUnit: 'l',
  shopIds: [],
}

describe('ReplaceShoppingListItemCommandHandler', () => {
  const householdId = '00000000-0000-0000-0000-000000000001'
  const shoppingListId = '00000000-0000-0000-0000-000000000010'

  test('replaces item successfully', async () => {
    const item = createTestShoppingListItem(shoppingListId, {
      name: 'Milk',
      description: 'Original',
    })

    const repository = createMockRepository(item)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(item.name).toBe('Updated Milk')
    expect(item.description).toBe('Updated description')
    expect(item.quantity).toBe(2)
    expect(item.quantityUnit).toBe('l')
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item does not exist', async () => {
    const repository = createMockRepository(null)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId,
        itemId: 'non-existent-item',
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    if (result.error.type === 'SHOPPING_LIST_ITEM_NOT_FOUND') {
      expect(result.error.id).toBe('non-existent-item')
    }
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('returns SHOPPING_LIST_ITEM_NOT_FOUND when item belongs to different shopping list', async () => {
    const differentShoppingListId = '00000000-0000-0000-0000-000000000020'
    const item = createTestShoppingListItem(differentShoppingListId)

    const repository = createMockRepository(item)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.type).toBe('SHOPPING_LIST_ITEM_NOT_FOUND')
    expect(repository.save).not.toHaveBeenCalled()
  })

  test('clears optional fields when set to null', async () => {
    const quantityResult = Quantity.create(5, 'l')
    if (!quantityResult.ok) throw new Error('Failed to create quantity')

    const props: ShoppingListItemProps = {
      id: generateShoppingListItemId(),
      shoppingListId: parseShoppingListId(shoppingListId),
      inventoryItemId: null,
      name: 'Milk',
      description: 'Some description',
      categoryId: null,
      quantity: quantityResult.value,
      checked: false,
      shopIds: [],
      photoKey: null,
      createdAt: new Date(),
      updatedAt: null,
    }
    const item = new ShoppingListItem(props)

    const repository = createMockRepository(item)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const command: ReplaceShoppingListItemCommand = {
      shoppingListId,
      itemId: item.id,
      name: 'Simple Item',
      description: null,
      categoryId: null,
      quantity: null,
      quantityUnit: null,
      shopIds: [],
    }

    const result = await handler.execute(command, {
      householdId,
    })

    expect(result.ok).toBe(true)
    expect(item.description).toBeNull()
    expect(item.quantity).toBeNull()
    expect(item.quantityUnit).toBeNull()
  })

  test('updates updatedAt timestamp', async () => {
    const item = createTestShoppingListItem(shoppingListId)

    const repository = createMockRepository(item)
    const handler = new ReplaceShoppingListItemCommandHandler(repository)

    const result = await handler.execute(
      {
        ...validCommand,
        shoppingListId,
        itemId: item.id,
      },
      { householdId },
    )

    expect(result.ok).toBe(true)
    expect(item.updatedAt).toBeInstanceOf(Date)
  })
})
