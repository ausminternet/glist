import { isBlank } from '@/utils/is-blank'

import { err, ok, Result } from '@glist/shared'
import { InventoryItemId } from '../inventory-item/inventory-item-id'
import { CategoryId } from '../shared/category-id'
import { HouseholdId } from '../shared/household-id'
import { ShopId } from '../shared/shop-id'
import { InvalidNameError, ShoppingListItemNotFoundError } from './errors'
import { ShoppingListId } from './shopping-list-id'
import {
  NewShoppingListItemInput,
  ShoppingListItem,
  ShoppingListItemError,
} from './shopping-list-item'
import { generateShoppingListItemId } from './shopping-list-item-id'

export type ShoppingListProps = {
  id: ShoppingListId
  householdId: HouseholdId
  name: string
  items: ShoppingListItem[]
  createdAt: Date
  updatedAt: Date | null
}

export class ShoppingList {
  constructor(private props: ShoppingListProps) {}

  static create(
    id: ShoppingListId,
    householdId: HouseholdId,
    name: string,
  ): Result<ShoppingList, InvalidNameError> {
    if (isBlank(name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    return ok(
      new ShoppingList({
        id,
        householdId,
        name,
        items: [],
        createdAt: new Date(),
        updatedAt: null,
      }),
    )
  }

  get id(): ShoppingListId {
    return this.props.id
  }
  get householdId(): HouseholdId {
    return this.props.householdId
  }
  get name(): string {
    return this.props.name
  }
  get items(): readonly ShoppingListItem[] {
    return this.props.items
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date | null {
    return this.props.updatedAt
  }

  changeName(name: string): Result<void, InvalidNameError> {
    if (isBlank(name)) {
      return err({ type: 'INVALID_NAME', reason: 'Name cannot be empty' })
    }

    this.props.name = name
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  clearChecked(): void {
    this.props.items = this.props.items.filter((item) => !item.checked)
    this.props.updatedAt = new Date()
  }

  addItem(
    input: NewShoppingListItemInput,
  ): Result<ShoppingListItem, ShoppingListItemError> {
    const itemResult = ShoppingListItem.create(
      generateShoppingListItemId(),
      this.props.id,
      input,
    )
    if (!itemResult.ok) {
      return itemResult
    }

    this.props.items.push(itemResult.value)
    this.props.updatedAt = new Date()
    return itemResult
  }

  addItemFromInventory(item: {
    inventoryItemId: InventoryItemId
    name: string
    description: string | null
    categoryId: CategoryId | null
    shopIds: readonly ShopId[]
  }): ShoppingListItem {
    const shoppingListItem = ShoppingListItem.createFromInventoryItem(
      generateShoppingListItemId(),
      this.props.id,
      item,
    )
    this.props.items.push(shoppingListItem)
    this.props.updatedAt = new Date()
    return shoppingListItem
  }

  removeItem(itemId: string): Result<void, ShoppingListItemNotFoundError> {
    const index = this.props.items.findIndex((item) => item.id === itemId)
    if (index === -1) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    this.props.items.splice(index, 1)
    this.props.updatedAt = new Date()

    return ok(undefined)
  }

  getItem(
    itemId: string,
  ): Result<ShoppingListItem, ShoppingListItemNotFoundError> {
    const item = this.props.items.find((item) => item.id === itemId)
    if (!item) {
      return err({ type: 'SHOPPING_LIST_ITEM_NOT_FOUND', id: itemId })
    }

    return ok(item)
  }

  findItem(itemId: string): ShoppingListItem | undefined {
    return this.props.items.find((item) => item.id === itemId)
  }
}
