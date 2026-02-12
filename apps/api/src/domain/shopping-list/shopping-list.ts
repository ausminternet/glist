import { isBlank } from '@/utils/is-blank'
import { InvalidNameError, ItemNotFoundError } from './errors'
import {
  NewShoppingListItemInput,
  ShoppingListItem,
} from './shopping-list-item'

type ShoppingListProps = {
  id: string
  householdId: string
  name: string
  items: ShoppingListItem[]
  createdAt: Date
  updatedAt: Date | null
}

export class ShoppingList {
  private constructor(private props: ShoppingListProps) {}

  static create(householdId: string, name: string): ShoppingList {
    if (isBlank(name)) {
      throw new InvalidNameError()
    }
    return new ShoppingList({
      id: crypto.randomUUID(),
      householdId,
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: null,
    })
  }

  static reconstitute(data: {
    id: string
    householdId: string
    name: string
    items: ShoppingListItem[]
    createdAt: Date
    updatedAt: Date | null
  }): ShoppingList {
    return new ShoppingList({
      id: data.id,
      householdId: data.householdId,
      name: data.name,
      items: data.items,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  get id(): string {
    return this.props.id
  }
  get householdId(): string {
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

  changeName(name: string): void {
    if (isBlank(name)) {
      throw new InvalidNameError()
    }
    this.props.name = name
    this.props.updatedAt = new Date()
  }

  clearChecked(): void {
    this.props.items = this.props.items.filter((item) => !item.checked)
    this.props.updatedAt = new Date()
  }

  addItem(input: NewShoppingListItemInput): ShoppingListItem {
    const item = ShoppingListItem.create(this.props.id, input)
    this.props.items.push(item)
    this.props.updatedAt = new Date()
    return item
  }

  addItemFromInventory(item: {
    name: string
    description: string | null
    categoryId: string | null
    shopIds: string[]
  }): ShoppingListItem {
    const shoppingListItem = ShoppingListItem.createFromInventoryItem(
      this.props.id,
      item,
    )
    this.props.items.push(shoppingListItem)
    this.props.updatedAt = new Date()
    return shoppingListItem
  }

  removeItem(itemId: string): void {
    const index = this.props.items.findIndex((item) => item.id === itemId)
    if (index === -1) {
      throw new ItemNotFoundError(itemId)
    }
    this.props.items.splice(index, 1)
    this.props.updatedAt = new Date()
  }

  getItem(itemId: string): ShoppingListItem {
    const item = this.props.items.find((item) => item.id === itemId)
    if (!item) {
      throw new ItemNotFoundError(itemId)
    }
    return item
  }

  findItem(itemId: string): ShoppingListItem | undefined {
    return this.props.items.find((item) => item.id === itemId)
  }

  toSnapshot() {
    return {
      id: this.props.id,
      householdId: this.props.householdId,
      name: this.props.name,
      items: this.props.items.map((item) => item.toSnapshot()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    } as const
  }
}
