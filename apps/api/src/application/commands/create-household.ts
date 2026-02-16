import { err, ok, type Result } from '@glist/shared'
import { Category } from '@/domain/category/category'
import { generateCategoryId } from '@/domain/category/category-id'
import type { CategoryRepository } from '@/domain/category/category-repository'
import {
  type CreateHouseholdError,
  generateHouseholdId,
  Household,
  type HouseholdId,
  type HouseholdRepository,
} from '@/domain/household'
import { Shop } from '@/domain/shop/shop'
import { generateShopId } from '@/domain/shop/shop-id'
import type { ShopRepository } from '@/domain/shop/shop-repository'

type CreateHouseholdCommand = {
  name: string
  shopNames?: string[]
  categoryNames?: string[]
}

const DEFAULT_SHOP_NAMES = [
  'Rewe',
  'Edeka',
  'Lidl',
  'Penny',
  'dm',
  'Rossmann',
  'Asiashop',
  'Denns',
  'Alnatura',
  'Netto',
]
const DEFAULT_CATEGORY_NAMES = [
  'Obst',
  'Gemüse',
  'Nüsse',
  'Körner & Flocken',
  'Kabberkram',
  'Konserven',
  'Backzutaten & Mehle',
  'Hülsenfrüchte & Pseudogetreide',
  'Fleisch & Fisch',
  'Milchprodukte',
  'HygieneArtikel',
  'Haushalt',
  'Getränke',
  'Tiefkühl',
]

export class CreateHouseholdCommandHandler {
  constructor(
    private readonly householdRepository: HouseholdRepository,
    private readonly shopRepository: ShopRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    command: CreateHouseholdCommand,
  ): Promise<Result<HouseholdId, CreateHouseholdError>> {
    const id = generateHouseholdId()
    const result = Household.create(id, { name: command.name })

    if (!result.ok) {
      return err(result.error)
    }

    const shopNames = command.shopNames ?? DEFAULT_SHOP_NAMES
    const shops = shopNames
      .map((name, i) =>
        Shop.create(generateShopId(), id, { name, sortOrder: i * 100 }),
      )
      .filter((result) => result.ok)
      .map((result) => result.value)

    const categoryNames = command.categoryNames ?? DEFAULT_CATEGORY_NAMES
    const categories = categoryNames
      .map((name, i) =>
        Category.create(generateCategoryId(), id, { name, sortOrder: i * 100 }),
      )
      .filter((result) => result.ok)
      .map((result) => result.value)

    await this.householdRepository.save(result.value)

    if (shops.length > 0) {
      await this.shopRepository.saveMany(shops)
    }

    if (categories.length > 0) {
      await this.categoryRepository.saveMany(categories)
    }

    return ok(result.value.id)
  }
}
