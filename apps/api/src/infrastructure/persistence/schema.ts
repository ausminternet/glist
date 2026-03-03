import type { UnitType } from '@glist/shared'
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const households = sqliteTable('households', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
})

export const categories = sqliteTable(
  'categories',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    sortOrder: real('sort_order').default(1000.0),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => [
    index('idx_categories_household_id').on(table.householdId),
    index('idx_categories_household_name').on(table.householdId, table.name),
  ],
)

export const shops = sqliteTable(
  'shops',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date(),
    ),
    sortOrder: real('sort_order').default(1000.0),
  },
  (table) => [
    index('idx_shops_household_id').on(table.householdId),
    index('idx_shops_household_name').on(table.householdId, table.name),
  ],
)

export const inventoryItems = sqliteTable(
  'inventory_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    targetStock: real('target_stock'),
    targetStockUnit: text('target_stock_unit').$type<UnitType>(),
    basePriceUnit: text('base_price_unit').$type<UnitType>(),
    basePriceCents: integer('base_price_cents'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => [
    index('idx_inventory_items_household_id').on(table.householdId),
    index('idx_inventory_items_category_id').on(table.categoryId),
  ],
)

export const shoppingListItems = sqliteTable(
  'shopping_list_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id').references(
      () => inventoryItems.id,
      { onDelete: 'set null' },
    ),
    quantity: real('quantity'),
    quantityUnit: text('quantity_unit').$type<UnitType>(),
    checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => [
    index('idx_shopping_list_items_household_id').on(table.householdId),
    index('idx_shopping_list_items_category_id').on(table.categoryId),
    index('idx_shopping_list_items_list_checked').on(
      table.householdId,
      table.checked,
    ),
  ],
)

export const shoppingListItemShops = sqliteTable(
  'shopping_list_item_shops',
  {
    shoppingListItemId: text('shopping_list_item_id')
      .notNull()
      .references(() => shoppingListItems.id, { onDelete: 'cascade' }),
    shopId: text('shop_id')
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.shoppingListItemId, table.shopId] }),
  ],
)

export const inventoryItemShops = sqliteTable(
  'inventory_item_shops',
  {
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    shopId: text('shop_id')
      .notNull()
      .references(() => shops.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.inventoryItemId, table.shopId] })],
)

export const inventoryItemPhotos = sqliteTable(
  'inventory_item_photos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    inventoryItemId: text('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    photoKey: text('photo_key').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_inventory_item_photos_item_id').on(table.inventoryItemId),
  ],
)

export const shoppingListItemPhotos = sqliteTable(
  'shopping_list_item_photos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    shoppingListItemId: text('shopping_list_item_id')
      .notNull()
      .references(() => shoppingListItems.id, { onDelete: 'cascade' }),
    photoKey: text('photo_key').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_shopping_list_item_photos_item_id').on(table.shoppingListItemId),
  ],
)
