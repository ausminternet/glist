import { Hono } from 'hono'
import bootstrapRouter from './bootstrap.router'
import categoriesRouter from './categories.router'
import { type HouseholdContext, withHousehold } from './context'
import inventoryItemsRouter from './inventory-items.router'
import shoppingListsRouter from './shopping-lists.router'
import shopsRouter from './shops.router'

const householdRouter = new Hono<HouseholdContext>()

householdRouter.use('*', withHousehold)
householdRouter.route('/bootstrap', bootstrapRouter)
householdRouter.route('/categories', categoriesRouter)
householdRouter.route('/inventory-items', inventoryItemsRouter)
householdRouter.route('/shopping-lists', shoppingListsRouter)
householdRouter.route('/shops', shopsRouter)

export default householdRouter
