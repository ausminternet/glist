// biome-ignore-all lint/style/noNonNullAssertion: Seed file with known data
import { createDb } from './index'
import {
  categories,
  households,
  inventoryItemShops,
  inventoryItems,
  shoppingListItemShops,
  shoppingListItems,
  shops,
} from './schema'

async function seed(d1: D1Database) {
  console.log('🌱 Seeding database...')

  const db = createDb(d1)

  try {
    console.log('🗑️  Resetting database...')

    await db.delete(shoppingListItemShops)
    await db.delete(inventoryItemShops)
    await db.delete(shoppingListItems)
    await db.delete(inventoryItems)
    await db.delete(shops)
    await db.delete(categories)
    await db.delete(households)

    console.log('✓ Database reset complete\n')

    const [household] = await db
      .insert(households)
      .values({
        name: 'Test Family',
      })
      .returning()

    console.log('✓ Created household:', household.name)

    const createdCategories = await db
      .insert(categories)
      .values([
        {
          name: 'Fruits & Vegetables',
          sortOrder: 1000,
          householdId: household.id,
        },
        { name: 'Dairy & Eggs', sortOrder: 2000, householdId: household.id },
        { name: 'Meat & Fish', sortOrder: 3000, householdId: household.id },
        { name: 'Bakery', sortOrder: 4000, householdId: household.id },
        { name: 'Pantry Staples', sortOrder: 5000, householdId: household.id },
        { name: 'Beverages', sortOrder: 6000, householdId: household.id },
        { name: 'Snacks', sortOrder: 7000, householdId: household.id },
        {
          name: 'Cleaning Supplies',
          sortOrder: 8000,
          householdId: household.id,
        },
        { name: 'Personal Care', sortOrder: 9000, householdId: household.id },
      ])
      .returning()

    console.log(`✓ Created ${createdCategories.length} categories`)

    const createdShops = await db
      .insert(shops)
      .values([
        { name: 'Supermarket', sortOrder: 1000, householdId: household.id },
        { name: 'Farmers Market', sortOrder: 2000, householdId: household.id },
        { name: 'Butcher', sortOrder: 3000, householdId: household.id },
        { name: 'Bakery', sortOrder: 4000, householdId: household.id },
        { name: 'Pharmacy', sortOrder: 5000, householdId: household.id },
      ])
      .returning()

    console.log(`✓ Created ${createdShops.length} shops`)

    const findCategory = (name: string) =>
      createdCategories.find((c) => c.name === name)
    const findShop = (name: string) => createdShops.find((s) => s.name === name)

    const inventoryNow = Date.now()
    const createdInventoryItems = await db
      .insert(inventoryItems)
      .values([
        {
          householdId: household.id,
          name: 'Milk',
          description: 'Fresh whole milk',
          categoryId: findCategory('Dairy & Eggs')?.id,
          targetStock: 2,
          targetStockUnit: 'l',
          basePriceCents: 150,
          basePriceUnit: 'l',
          createdAt: new Date(inventoryNow),
        },
        {
          householdId: household.id,
          name: 'Bread',
          description: 'Whole wheat bread',
          categoryId: findCategory('Bakery')?.id,
          targetStock: 1,
          targetStockUnit: 'piece',
          basePriceCents: 250,
          basePriceUnit: 'piece',
          createdAt: new Date(inventoryNow + 1000),
        },
        {
          householdId: household.id,
          name: 'Eggs',
          description: 'Free range eggs',
          categoryId: findCategory('Dairy & Eggs')?.id,
          targetStock: 12,
          targetStockUnit: 'piece',
          basePriceCents: 30,
          basePriceUnit: 'piece',
          createdAt: new Date(inventoryNow + 2000),
        },
        {
          householdId: household.id,
          name: 'Apples',
          description: 'Fresh organic apples',
          categoryId: findCategory('Fruits & Vegetables')?.id,
          targetStock: 1.5,
          targetStockUnit: 'kg',
          basePriceCents: 300,
          basePriceUnit: 'kg',
          createdAt: new Date(inventoryNow + 3000),
        },
      ])
      .returning()

    console.log(`✓ Created ${createdInventoryItems.length} inventory items`)

    const findInventoryItem = (name: string) =>
      createdInventoryItems.find((i) => i.name === name)

    const now = Date.now()
    const createdShoppingListItems = await db
      .insert(shoppingListItems)
      .values([
        {
          householdId: household.id,
          name: 'Milk',
          categoryId: findCategory('Dairy & Eggs')?.id,
          inventoryItemId: findInventoryItem('Milk')?.id,
          quantity: 2,
          quantityUnit: 'l',
          checked: false,
          createdAt: new Date(now),
        },
        {
          householdId: household.id,
          name: 'Bread',
          categoryId: findCategory('Bakery')?.id,
          inventoryItemId: findInventoryItem('Bread')?.id,
          quantity: 2,
          quantityUnit: 'piece',
          checked: false,
          createdAt: new Date(now + 1000),
        },
        {
          householdId: household.id,
          name: 'Bananas',
          description: 'Ripe yellow bananas',
          categoryId: findCategory('Fruits & Vegetables')?.id,
          quantity: 1,
          quantityUnit: 'kg',
          checked: false,
          createdAt: new Date(now + 2000),
        },
        {
          householdId: household.id,
          name: 'Chicken Breast',
          categoryId: findCategory('Meat & Fish')?.id,
          quantity: 500,
          quantityUnit: 'g',
          checked: true,
          createdAt: new Date(now + 3000),
        },
      ])
      .returning()

    console.log(
      `✓ Created ${createdShoppingListItems.length} shopping list items`,
    )

    const findShoppingListItem = (name: string) =>
      createdShoppingListItems.find((i) => i.name === name)

    await db.insert(shoppingListItemShops).values([
      {
        shoppingListItemId: findShoppingListItem('Milk')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        shoppingListItemId: findShoppingListItem('Bread')!.id,
        shopId: findShop('Bakery')!.id,
      },
      {
        shoppingListItemId: findShoppingListItem('Bananas')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        shoppingListItemId: findShoppingListItem('Bananas')!.id,
        shopId: findShop('Farmers Market')!.id,
      },
      {
        shoppingListItemId: findShoppingListItem('Chicken Breast')!.id,
        shopId: findShop('Butcher')!.id,
      },
      {
        shoppingListItemId: findShoppingListItem('Chicken Breast')!.id,
        shopId: findShop('Farmers Market')!.id,
      },
    ])

    console.log('✓ Created 8 shopping list item-shop relationships')

    await db.insert(inventoryItemShops).values([
      {
        inventoryItemId: findInventoryItem('Milk')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Milk')!.id,
        shopId: findShop('Farmers Market')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Bread')!.id,
        shopId: findShop('Bakery')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Bread')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Eggs')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Eggs')!.id,
        shopId: findShop('Farmers Market')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Apples')!.id,
        shopId: findShop('Supermarket')!.id,
      },
      {
        inventoryItemId: findInventoryItem('Apples')!.id,
        shopId: findShop('Farmers Market')!.id,
      },
    ])

    console.log('✓ Created 8 inventory item-shop relationships')

    console.log('\n✅ Database seeded successfully!')
    console.log('\nCreated:')
    console.log(`  - 1 household: ${household.name}`)
    console.log(`  - ${createdCategories.length} categories`)
    console.log(`  - ${createdShops.length} shops`)
    console.log(`  - ${createdInventoryItems.length} inventory items`)
    console.log(`  - ${createdShoppingListItems.length} shopping list items`)
    console.log('  - 8 shopping list item-shop relations')
    console.log('  - 8 inventory item-shop relations')

    return { householdId: household.id }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

export { seed }
