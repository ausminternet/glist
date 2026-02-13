import { Hono } from 'hono'
import bootstrapRouter from './bootstrap.router'
import { HouseholdContext, withHousehold } from './context'
import inventoryItemsRouter from './inventory-items.router'
import shoppingListsRouter from './shopping-lists.router'

const householdRouter = new Hono<HouseholdContext>()

householdRouter.use('*', withHousehold)
householdRouter.route('/bootstrap', bootstrapRouter)
householdRouter.route('/inventory-items', inventoryItemsRouter)
householdRouter.route('/shopping-lists', shoppingListsRouter)

export default householdRouter
